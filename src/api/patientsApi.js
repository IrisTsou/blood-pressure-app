import { createAuthHeaders, requestJson } from "./apiClient";

export function fetchAccessiblePatients(accessToken) {
  return requestJson("/api/patients", {
    headers: createAuthHeaders(accessToken),
  });
}

export function createPatient(patient, accessToken) {
  return requestJson("/api/patients", {
    method: "POST",
    headers: createAuthHeaders(accessToken),
    body: JSON.stringify(patient),
  });
}
