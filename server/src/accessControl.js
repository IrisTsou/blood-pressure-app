import { supabase } from "./supabaseClient.js";

export async function getRecordAccess(userId, patientId) {
  const { data, error } = await supabase
    .from("care_memberships")
    .select("can_view, can_create, can_update, can_delete, can_manage_members")
    .eq("patient_id", patientId)
    .eq("caregiver_user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    canView: Boolean(data?.can_view),
    canCreate: Boolean(data?.can_create),
    canUpdate: Boolean(data?.can_update),
    canDelete: Boolean(data?.can_delete),
    canManageMembers: Boolean(data?.can_manage_members),
  };
}

export async function requireRecordAccess(userId, patientId, permission) {
  const access = await getRecordAccess(userId, patientId);

  if (!access[permission]) {
    const error = new Error("You do not have permission to access this patient's records");
    error.statusCode = 403;
    throw error;
  }
}
