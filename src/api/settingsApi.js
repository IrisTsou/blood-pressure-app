import { createAuthHeaders, requestJson } from "./apiClient";

export function fetchNotificationSettings(patientId, accessToken) {
  return requestJson(`/api/patients/${patientId}/settings`, {
    headers: createAuthHeaders(accessToken),
  });
}

export function updateNotificationSettings(patientId, settings, accessToken) {
  return requestJson(`/api/patients/${patientId}/settings`, {
    method: "PUT",
    headers: createAuthHeaders(accessToken),
    body: JSON.stringify(settings),
  });
}
