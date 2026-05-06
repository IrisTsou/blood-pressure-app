import express from "express";
import { requireRecordAccess } from "./accessControl.js";
import { requireAuth } from "./authMiddleware.js";
import { createAlertEventForRecord } from "./notificationEvents.js";
import { toClientRecord, toCreateDatabaseRecord, toDatabaseRecord } from "./recordMapper.js";
import { supabase } from "./supabaseClient.js";

const router = express.Router();

router.use(requireAuth);

function validateRecordInput(record) {
  if (!record) {
    return "record body is required";
  }

  const requiredFields = ["date", "time", "systolic", "diastolic", "pulse"];
  const missingField = requiredFields.find((field) => record[field] === undefined || record[field] === "");

  if (missingField) {
    return `${missingField} is required`;
  }

  if ([record.systolic, record.diastolic, record.pulse].some((value) => Number.isNaN(Number(value)))) {
    return "systolic, diastolic, and pulse must be numbers";
  }

  return null;
}

async function getExistingRecord(recordId) {
  const { data, error } = await supabase
    .from("blood_pressure_records")
    .select("id, patient_id")
    .eq("id", recordId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

router.get("/", async (request, response, next) => {
  try {
    const patientId = request.query.patientId;

    if (!patientId) {
      return response.status(400).json({ error: "patientId is required" });
    }

    await requireRecordAccess(request.user.id, patientId, "canView");

    const { data, error } = await supabase
      .from("blood_pressure_records")
      .select("*")
      .eq("patient_id", patientId)
      .order("measured_date", { ascending: false })
      .order("measured_time", { ascending: false });

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    return response.json(data.map(toClientRecord));
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const validationError = validateRecordInput(request.body);

    if (validationError) {
      return response.status(400).json({ error: validationError });
    }

    const patientId = request.body.patientId;

    if (!patientId) {
      return response.status(400).json({ error: "patientId is required" });
    }

    await requireRecordAccess(request.user.id, patientId, "canCreate");

    const { data, error } = await supabase
      .from("blood_pressure_records")
      .insert(toCreateDatabaseRecord(request.body, patientId, request.user.id))
      .select("*")
      .single();

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    await createAlertEventForRecord(data);

    return response.status(201).json(toClientRecord(data));
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (request, response, next) => {
  try {
    const validationError = validateRecordInput(request.body);

    if (validationError) {
      return response.status(400).json({ error: validationError });
    }

    const existingRecord = await getExistingRecord(request.params.id);

    if (!existingRecord) {
      return response.status(404).json({ error: "Record not found" });
    }

    await requireRecordAccess(request.user.id, existingRecord.patient_id, "canUpdate");

    const { data, error } = await supabase
      .from("blood_pressure_records")
      .update(toDatabaseRecord(request.body, existingRecord.patient_id, request.user.id))
      .eq("id", request.params.id)
      .eq("patient_id", existingRecord.patient_id)
      .select("*")
      .single();

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    return response.json(toClientRecord(data));
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (request, response, next) => {
  try {
    const existingRecord = await getExistingRecord(request.params.id);

    if (!existingRecord) {
      return response.status(404).json({ error: "Record not found" });
    }

    await requireRecordAccess(request.user.id, existingRecord.patient_id, "canDelete");

    const { error } = await supabase
      .from("blood_pressure_records")
      .delete()
      .eq("id", request.params.id)
      .eq("patient_id", existingRecord.patient_id);

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
