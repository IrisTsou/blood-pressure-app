import { createAuthHeaders, requestJson } from "./apiClient";

export function fetchMyProfile(accessToken) {
  return requestJson("/api/profiles/me", {
    headers: createAuthHeaders(accessToken),
  });
}

export function updateMyProfile(profile, accessToken) {
  return requestJson("/api/profiles/me", {
    method: "PUT",
    headers: createAuthHeaders(accessToken),
    body: JSON.stringify(profile),
  });
}
