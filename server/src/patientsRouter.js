import express from "express";
import { requireAuth } from "./authMiddleware.js";
import { supabase } from "./supabaseClient.js";

const router = express.Router();

router.use(requireAuth);

function toClientPatient(patient, membership) {
  return {
    id: patient.id,
    displayName: patient.display_name,
    relationship: membership.role,
    permissions: {
      canView: membership.can_view,
      canCreate: membership.can_create,
      canUpdate: membership.can_update,
      canDelete: membership.can_delete,
      canManageMembers: membership.can_manage_members,
    },
  };
}

router.get("/", async (request, response) => {
  const { data: memberships, error: membershipsError } = await supabase
    .from("care_memberships")
    .select("patient_id, role, can_view, can_create, can_update, can_delete, can_manage_members")
    .eq("caregiver_user_id", request.user.id)
    .eq("status", "active")
    .eq("can_view", true);

  if (membershipsError) {
    return response.status(500).json({ error: membershipsError.message });
  }

  const patientIds = memberships.map((membership) => membership.patient_id);
  const { data: patients, error: patientsError } = patientIds.length > 0
    ? await supabase
        .from("patients")
        .select("id, display_name")
        .in("id", patientIds)
    : { data: [], error: null };

  if (patientsError) {
    return response.status(500).json({ error: patientsError.message });
  }

  const patientById = new Map(patients.map((patient) => [patient.id, patient]));
  const accessiblePatients = memberships
    .map((membership) => {
      const patient = patientById.get(membership.patient_id);

      return patient ? toClientPatient(patient, membership) : null;
    })
    .filter(Boolean);

  return response.json(accessiblePatients);
});

router.post("/", async (request, response) => {
  const displayName = request.body?.displayName?.trim();

  if (!displayName) {
    return response.status(400).json({ error: "displayName is required" });
  }

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .insert({
      display_name: displayName,
      birth_year: request.body.birthYear || null,
      note: request.body.note || null,
      created_by: request.user.id,
    })
    .select("id, display_name")
    .single();

  if (patientError) {
    return response.status(500).json({ error: patientError.message });
  }

  const membership = {
    patient_id: patient.id,
    caregiver_user_id: request.user.id,
    role: "manager",
    can_view: true,
    can_create: true,
    can_update: true,
    can_delete: true,
    can_manage_members: true,
    status: "active",
  };

  const { data: createdMembership, error: membershipError } = await supabase
    .from("care_memberships")
    .insert(membership)
    .select("role, can_view, can_create, can_update, can_delete, can_manage_members")
    .single();

  if (membershipError) {
    return response.status(500).json({ error: membershipError.message });
  }

  return response.status(201).json(toClientPatient(patient, createdMembership));
});

export default router;
