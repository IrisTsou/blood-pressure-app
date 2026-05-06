import { createAuthHeaders, requestJson } from "./apiClient";

export function createLineBindingCode(patientId, accessToken) {
  return requestJson(`/api/patients/${patientId}/line/binding-code`, {
    method: "POST",
    headers: createAuthHeaders(accessToken),
  });
}

export function sendPendingLineNotifications(patientId, accessToken) {
  return requestJson(`/api/patients/${patientId}/line/send-pending`, {
    method: "POST",
    headers: createAuthHeaders(accessToken),
  });
}
