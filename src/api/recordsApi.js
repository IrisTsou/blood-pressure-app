import { createAuthHeaders, requestJson } from "./apiClient";

export function fetchRecords(accessToken, patientId) {
  const searchParams = new URLSearchParams();

  if (patientId) {
    searchParams.set("patientId", patientId);
  }

  const queryString = searchParams.toString();

  return requestJson(`/api/records${queryString ? `?${queryString}` : ""}`, {
    headers: createAuthHeaders(accessToken),
  });
}

export function createRecord(record, accessToken, patientId) {
  return requestJson("/api/records", {
    method: "POST",
    headers: createAuthHeaders(accessToken),
    body: JSON.stringify({
      ...record,
      patientId,
    }),
  });
}

export function updateRecord(record, accessToken) {
  return requestJson(`/api/records/${record.id}`, {
    method: "PUT",
    headers: createAuthHeaders(accessToken),
    body: JSON.stringify(record),
  });
}

export function deleteRecord(recordId, accessToken) {
  return requestJson(`/api/records/${recordId}`, {
    method: "DELETE",
    headers: createAuthHeaders(accessToken),
  });
}
