export const DEFAULT_THRESHOLDS = {
  highSystolic: 140,
  highDiastolic: 90,
  lowSystolic: 90,
  lowDiastolic: 60,
};

export function normalizeThresholds(settings) {
  return {
    highSystolic: settings?.high_systolic ?? settings?.highSystolic ?? DEFAULT_THRESHOLDS.highSystolic,
    highDiastolic: settings?.high_diastolic ?? settings?.highDiastolic ?? DEFAULT_THRESHOLDS.highDiastolic,
    lowSystolic: settings?.low_systolic ?? settings?.lowSystolic ?? DEFAULT_THRESHOLDS.lowSystolic,
    lowDiastolic: settings?.low_diastolic ?? settings?.lowDiastolic ?? DEFAULT_THRESHOLDS.lowDiastolic,
  };
}

export function getBloodPressureStatus(record, settings) {
  const thresholds = normalizeThresholds(settings);

  if (record.systolic >= thresholds.highSystolic || record.diastolic >= thresholds.highDiastolic) {
    return {
      level: "high",
      label: "血壓偏高",
      eventType: "blood_pressure_high",
      message: `血壓偏高：收縮壓 ${record.systolic}，舒張壓 ${record.diastolic}`,
    };
  }

  if (record.systolic < thresholds.lowSystolic || record.diastolic < thresholds.lowDiastolic) {
    return {
      level: "low",
      label: "血壓偏低",
      eventType: "blood_pressure_low",
      message: `血壓偏低：收縮壓 ${record.systolic}，舒張壓 ${record.diastolic}`,
    };
  }

  return {
    level: "normal",
    label: "目前狀態正常",
    eventType: null,
    message: "",
  };
}
