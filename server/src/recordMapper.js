export function toClientRecord(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    date: row.measured_date,
    time: row.measured_time?.slice(0, 5),
    systolic: row.systolic,
    diastolic: row.diastolic,
    pulse: row.pulse,
    note: row.note ?? "",
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toDatabaseRecord(record, patientId, actorUserId) {
  return {
    patient_id: patientId,
    updated_by: actorUserId,
    measured_date: record.date,
    measured_time: record.time,
    systolic: Number(record.systolic),
    diastolic: Number(record.diastolic),
    pulse: Number(record.pulse),
    note: record.note || null,
    updated_at: new Date().toISOString(),
  };
}

export function toCreateDatabaseRecord(record, patientId, actorUserId) {
  return {
    ...toDatabaseRecord(record, patientId, actorUserId),
    created_by: actorUserId,
  };
}
