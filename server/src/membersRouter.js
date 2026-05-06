import express from "express";
import { requireRecordAccess } from "./accessControl.js";
import { requireAuth } from "./authMiddleware.js";
import { supabase } from "./supabaseClient.js";

const router = express.Router({ mergeParams: true });

router.use(requireAuth);

function toClientMember(membership, profile, email) {
  return {
    id: membership.id,
    patientId: membership.patient_id,
    caregiverUserId: membership.caregiver_user_id,
    email,
    displayName: profile?.display_name ?? email ?? "照護者",
    role: membership.role,
    status: membership.status,
    permissions: {
      canView: membership.can_view,
      canCreate: membership.can_create,
      canUpdate: membership.can_update,
      canDelete: membership.can_delete,
      canManageMembers: membership.can_manage_members,
      notifyOnAlert: membership.notify_on_alert,
      notifyOnDailySummary: membership.notify_on_daily_summary,
    },
  };
}

async function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;

  while (page < 20) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);

    if (user || data.users.length < 100) {
      return user ?? null;
    }

    page += 1;
  }

  return null;
}

async function getProfilesByUserIds(userIds) {
  if (userIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);

  if (error) {
    throw error;
  }

  return new Map(data.map((profile) => [profile.id, profile]));
}

async function getEmailsByUserIds(userIds) {
  const emailsById = new Map();
  let page = 1;

  while (page < 20 && emailsById.size < userIds.length) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw error;
    }

    data.users.forEach((user) => {
      if (userIds.includes(user.id)) {
        emailsById.set(user.id, user.email);
      }
    });

    if (data.users.length < 100) {
      break;
    }

    page += 1;
  }

  return emailsById;
}

function readPermissions(body) {
  return {
    role: body.role || "caregiver",
    can_view: Boolean(body.canView),
    can_create: Boolean(body.canCreate),
    can_update: Boolean(body.canUpdate),
    can_delete: Boolean(body.canDelete),
    can_manage_members: Boolean(body.canManageMembers),
    notify_on_alert: Boolean(body.notifyOnAlert),
    notify_on_daily_summary: Boolean(body.notifyOnDailySummary),
    status: body.status || "active",
  };
}

router.use(async (request, _response, next) => {
  try {
    await requireRecordAccess(request.user.id, request.params.patientId, "canManageMembers");
    return next();
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (request, response, next) => {
  try {
    const { data: memberships, error } = await supabase
      .from("care_memberships")
      .select("id, patient_id, caregiver_user_id, role, status, can_view, can_create, can_update, can_delete, can_manage_members, notify_on_alert, notify_on_daily_summary")
      .eq("patient_id", request.params.patientId)
      .order("created_at", { ascending: true });

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    const userIds = memberships.map((membership) => membership.caregiver_user_id);
    const [profilesById, emailsById] = await Promise.all([
      getProfilesByUserIds(userIds),
      getEmailsByUserIds(userIds),
    ]);

    return response.json(
      memberships.map((membership) =>
        toClientMember(
          membership,
          profilesById.get(membership.caregiver_user_id),
          emailsById.get(membership.caregiver_user_id)
        )
      )
    );
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const email = request.body?.email?.trim();

    if (!email) {
      return response.status(400).json({ error: "email is required" });
    }

    const caregiverUser = await findUserByEmail(email);

    if (!caregiverUser) {
      return response.status(404).json({ error: "找不到這個 Email 對應的使用者，請對方先註冊帳號" });
    }

    const membershipPayload = {
      patient_id: request.params.patientId,
      caregiver_user_id: caregiverUser.id,
      ...readPermissions(request.body),
    };

    const { data, error } = await supabase
      .from("care_memberships")
      .upsert(membershipPayload, {
        onConflict: "patient_id,caregiver_user_id",
      })
      .select("id, patient_id, caregiver_user_id, role, status, can_view, can_create, can_update, can_delete, can_manage_members, notify_on_alert, notify_on_daily_summary")
      .single();

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    const profilesById = await getProfilesByUserIds([caregiverUser.id]);

    return response
      .status(201)
      .json(toClientMember(data, profilesById.get(caregiverUser.id), caregiverUser.email));
  } catch (error) {
    return next(error);
  }
});

router.put("/:memberId", async (request, response, next) => {
  try {
    const { data, error } = await supabase
      .from("care_memberships")
      .update({
        ...readPermissions(request.body),
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.params.memberId)
      .eq("patient_id", request.params.patientId)
      .select("id, patient_id, caregiver_user_id, role, status, can_view, can_create, can_update, can_delete, can_manage_members, notify_on_alert, notify_on_daily_summary")
      .single();

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    const [profilesById, emailsById] = await Promise.all([
      getProfilesByUserIds([data.caregiver_user_id]),
      getEmailsByUserIds([data.caregiver_user_id]),
    ]);

    return response.json(
      toClientMember(data, profilesById.get(data.caregiver_user_id), emailsById.get(data.caregiver_user_id))
    );
  } catch (error) {
    return next(error);
  }
});

router.delete("/:memberId", async (request, response, next) => {
  try {
    const { error } = await supabase
      .from("care_memberships")
      .delete()
      .eq("id", request.params.memberId)
      .eq("patient_id", request.params.patientId);

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
