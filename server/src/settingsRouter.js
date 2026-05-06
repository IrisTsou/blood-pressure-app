import express from "express";
import { requireRecordAccess } from "./accessControl.js";
import { requireAuth } from "./authMiddleware.js";
import { supabase } from "./supabaseClient.js";

const router = express.Router({ mergeParams: true });

router.use(requireAuth);

function toClientSettings(row, patientId) {
  return {
    patientId,
    highSystolic: row?.high_systolic ?? 140,
    highDiastolic: row?.high_diastolic ?? 90,
    lowSystolic: row?.low_systolic ?? 90,
    lowDiastolic: row?.low_diastolic ?? 60,
    dailySummaryEnabled: row?.daily_summary_enabled ?? false,
    dailySummaryTime: row?.daily_summary_time?.slice(0, 5) ?? "21:00",
  };
}

function toDatabaseSettings(body, patientId) {
  return {
    patient_id: patientId,
    high_systolic: Number(body.highSystolic),
    high_diastolic: Number(body.highDiastolic),
    low_systolic: Number(body.lowSystolic),
    low_diastolic: Number(body.lowDiastolic),
    daily_summary_enabled: Boolean(body.dailySummaryEnabled),
    daily_summary_time: body.dailySummaryTime || "21:00",
    updated_at: new Date().toISOString(),
  };
}

router.get("/", async (request, response, next) => {
  try {
    await requireRecordAccess(request.user.id, request.params.patientId, "canView");

    const { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("patient_id", request.params.patientId)
      .maybeSingle();

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    return response.json(toClientSettings(data, request.params.patientId));
  } catch (error) {
    return next(error);
  }
});

router.put("/", async (request, response, next) => {
  try {
    await requireRecordAccess(request.user.id, request.params.patientId, "canManageMembers");

    const { data, error } = await supabase
      .from("notification_settings")
      .upsert(toDatabaseSettings(request.body, request.params.patientId), {
        onConflict: "patient_id",
      })
      .select("*")
      .single();

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    return response.json(toClientSettings(data, request.params.patientId));
  } catch (error) {
    return next(error);
  }
});

export default router;
