export function createAuthHeaders(accessToken) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export async function requestJson(url, options = {}) {
  const { headers, ...requestOptions } = options;
  const response = await fetch(url, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const errorBody = await response.json().catch(() => ({}));

      throw new Error(errorBody.error ?? `API request failed (${response.status})`);
    }

    const errorText = await response.text().catch(() => "");

    throw new Error(
      `API request failed (${response.status}): ${errorText.slice(0, 80) || "Non-JSON response"}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  if (!contentType.includes("application/json")) {
    throw new Error("API 回傳的不是 JSON，請確認後端 server 和 Vite proxy 有正常啟動");
  }

  return response.json();
}
