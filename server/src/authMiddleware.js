import { supabase } from "./supabaseClient.js";

export async function requireAuth(request, response, next) {
  const authHeader = request.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return response.status(401).json({ error: "Missing access token" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return response.status(401).json({ error: "Invalid access token" });
  }

  request.user = data.user;
  return next();
}
