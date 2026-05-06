export const DEFAULT_BLOOD_PRESSURE_THRESHOLDS = {
  highSystolic: 140,
  highDiastolic: 90,
  lowSystolic: 90,
  lowDiastolic: 60,
};

export function normalizeBloodPressureThresholds(thresholds) {
  return {
    highSystolic: thresholds?.highSystolic ?? DEFAULT_BLOOD_PRESSURE_THRESHOLDS.highSystolic,
    highDiastolic: thresholds?.highDiastolic ?? DEFAULT_BLOOD_PRESSURE_THRESHOLDS.highDiastolic,
    lowSystolic: thresholds?.lowSystolic ?? DEFAULT_BLOOD_PRESSURE_THRESHOLDS.lowSystolic,
    lowDiastolic: thresholds?.lowDiastolic ?? DEFAULT_BLOOD_PRESSURE_THRESHOLDS.lowDiastolic,
  };
}

export function getBloodPressureStatus(record, thresholds = DEFAULT_BLOOD_PRESSURE_THRESHOLDS) {
  const normalizedThresholds = normalizeBloodPressureThresholds(thresholds);

  if (!record) {
    return {
      level: "unknown",
      label: "尚無紀錄",
      description: "請先新增第一筆血壓紀錄",
    };
  }

  if (record.systolic >= normalizedThresholds.highSystolic || record.diastolic >= normalizedThresholds.highDiastolic) {
    return {
      level: "high",
      label: "血壓偏高",
      description: `收縮壓達 ${normalizedThresholds.highSystolic} 或舒張壓達 ${normalizedThresholds.highDiastolic} 以上`,
    };
  }

  if (record.systolic < normalizedThresholds.lowSystolic || record.diastolic < normalizedThresholds.lowDiastolic) {
    return {
      level: "low",
      label: "血壓偏低",
      description: `收縮壓低於 ${normalizedThresholds.lowSystolic} 或舒張壓低於 ${normalizedThresholds.lowDiastolic}`,
    };
  }

  return {
    level: "normal",
    label: "目前狀態正常",
    description: "血壓落在預設觀察範圍內",
  };
}
