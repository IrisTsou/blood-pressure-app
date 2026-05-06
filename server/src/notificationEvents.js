import { getBloodPressureStatus } from "./bloodPressureStatus.js";
import { supabase } from "./supabaseClient.js";

async function loadNotificationSettings(patientId) {
  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function createAlertEventForRecord(record) {
  const settings = await loadNotificationSettings(record.patient_id);
  const status = getBloodPressureStatus(
    {
      systolic: record.systolic,
      diastolic: record.diastolic,
    },
    settings
  );

  if (!status.eventType) {
    return null;
  }

  const { data, error } = await supabase
    .from("notification_events")
    .insert({
      patient_id: record.patient_id,
      record_id: record.id,
      event_type: status.eventType,
      message: `${status.message}（測量時間：${record.measured_date} ${record.measured_time?.slice(0, 5)}）`,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
