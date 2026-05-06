import express from "express";
import { requireAuth } from "./authMiddleware.js";
import { supabase } from "./supabaseClient.js";

const router = express.Router();

router.use(requireAuth);

function toClientProfile(profile, user) {
  return {
    id: user.id,
    email: user.email,
    displayName: profile?.display_name ?? "",
    phone: profile?.phone ?? "",
  };
}

router.get("/me", async (request, response) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, phone")
    .eq("id", request.user.id)
    .maybeSingle();

  if (error) {
    return response.status(500).json({ error: error.message });
  }

  return response.json(toClientProfile(data, request.user));
});

router.put("/me", async (request, response) => {
  const displayName = request.body?.displayName?.trim();

  if (!displayName) {
    return response.status(400).json({ error: "displayName is required" });
  }

  const profile = {
    id: request.user.id,
    display_name: displayName,
    phone: request.body.phone?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile)
    .select("id, display_name, phone")
    .single();

  if (error) {
    return response.status(500).json({ error: error.message });
  }

  return response.json(toClientProfile(data, request.user));
});

export default router;
