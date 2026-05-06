import { createAuthHeaders, requestJson } from "./apiClient";

export function fetchPatientMembers(patientId, accessToken) {
  return requestJson(`/api/patients/${patientId}/members`, {
    headers: createAuthHeaders(accessToken),
  });
}

export function createPatientMember(patientId, member, accessToken) {
  return requestJson(`/api/patients/${patientId}/members`, {
    method: "POST",
    headers: createAuthHeaders(accessToken),
    body: JSON.stringify(member),
  });
}

export function updatePatientMember(patientId, memberId, member, accessToken) {
  return requestJson(`/api/patients/${patientId}/members/${memberId}`, {
    method: "PUT",
    headers: createAuthHeaders(accessToken),
    body: JSON.stringify(member),
  });
}

export function deletePatientMember(patientId, memberId, accessToken) {
  return requestJson(`/api/patients/${patientId}/members/${memberId}`, {
    method: "DELETE",
    headers: createAuthHeaders(accessToken),
  });
}
