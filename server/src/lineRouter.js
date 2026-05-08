import express from "express";
import { requireRecordAccess } from "./accessControl.js";
import { requireAuth } from "./authMiddleware.js";
import { pushLineMessage, verifyLineSignature } from "./lineClient.js";
import { supabase } from "./supabaseClient.js";

export const lineWebhookRouter = express.Router();
export const lineApiRouter = express.Router({ mergeParams: true });

function generateBindingCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function bindLineTargetToPatient(code, target) {
  const now = new Date().toISOString();
  const { data: bindingCode, error: codeError } = await supabase
    .from("line_binding_codes")
    .select("id, patient_id, expires_at, used_at")
    .eq("code", code)
    .maybeSingle();

  if (codeError) {
    throw codeError;
  }

  if (!bindingCode || bindingCode.used_at || bindingCode.expires_at < now) {
    return false;
  }

  const { error: bindingError } = await supabase
    .from("line_bindings")
    .upsert(
      {
        patient_id: bindingCode.patient_id,
        target_type: target.type,
        target_id: target.id,
        display_name: target.displayName,
        status: "active",
        updated_at: now,
      },
      {
        onConflict: "patient_id,target_type,target_id",
      }
    );

  if (bindingError) {
    throw bindingError;
  }

  const { error: updateCodeError } = await supabase
    .from("line_binding_codes")
    .update({ used_at: now })
    .eq("id", bindingCode.id);

  if (updateCodeError) {
    throw updateCodeError;
  }

  return true;
}

function getLineTarget(source) {
  if (source?.groupId) {
    return {
      type: "group",
      id: source.groupId,
      displayName: "LINE 群組",
    };
  }

  if (source?.userId) {
    return {
      type: "user",
      id: source.userId,
      displayName: "個人 LINE",
    };
  }

  return null;
}

lineWebhookRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response, next) => {
    try {
      const signature = request.get("x-line-signature");

      if (!verifyLineSignature(request.body, signature)) {
        return response.status(401).json({ error: "Invalid LINE signature" });
      }

      const payload = JSON.parse(request.body.toString("utf8"));

      for (const event of payload.events ?? []) {
        const text = event.message?.type === "text" ? event.message.text.trim() : "";
        const target = getLineTarget(event.source);
        const matchedCode = text.match(/^綁定\s+([A-Z0-9]{6})$/i)?.[1]?.toUpperCase();

        if (event.type === "message" && target && matchedCode) {
          const isBound = await bindLineTargetToPatient(matchedCode, target);

          await pushLineMessage(
            target.id,
            isBound ? "LINE 綁定完成，之後會接收異常血壓通知。" : "綁定碼無效或已過期，請回網站重新產生。"
          );
        }
      }

      return response.json({ ok: true });
    } catch (error) {
      return next(error);
    }
  }
);

lineApiRouter.use(requireAuth);

lineApiRouter.post("/binding-code", async (request, response, next) => {
  try {
    await requireRecordAccess(request.user.id, request.params.patientId, "canManageMembers");

    const code = generateBindingCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("line_binding_codes")
      .insert({
        patient_id: request.params.patientId,
        code,
        expires_at: expiresAt,
        created_by: request.user.id,
      })
      .select("code, expires_at")
      .single();

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    return response.status(201).json({
      code: data.code,
      expiresAt: data.expires_at,
      instruction: `請在 LINE 群組輸入：綁定 ${data.code}`,
    });
  } catch (error) {
    return next(error);
  }
});

lineApiRouter.post("/send-pending", async (request, response, next) => {
  try {
    await requireRecordAccess(request.user.id, request.params.patientId, "canManageMembers");

    const { data: events, error: eventsError } = await supabase
      .from("notification_events")
      .select("id, patient_id, message")
      .eq("patient_id", request.params.patientId)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(20);

    if (eventsError) {
      return response.status(500).json({ error: eventsError.message });
    }

    const { data: bindings, error: bindingsError } = await supabase
      .from("line_bindings")
      .select("target_id")
      .eq("patient_id", request.params.patientId)
      .eq("status", "active");

    if (bindingsError) {
      return response.status(500).json({ error: bindingsError.message });
    }

    let sentCount = 0;

    for (const event of events) {
      try {
        await Promise.all(bindings.map((binding) => pushLineMessage(binding.target_id, event.message)));
        await supabase
          .from("notification_events")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", event.id);
        sentCount += 1;
      } catch (error) {
        await supabase
          .from("notification_events")
          .update({ status: "failed" })
          .eq("id", event.id);
      }
    }

    return response.json({ sentCount, pendingCount: events.length });
  } catch (error) {
    return next(error);
  }
});
