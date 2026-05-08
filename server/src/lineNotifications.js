import { pushLineMessage } from "./lineClient.js";
import { supabase } from "./supabaseClient.js";

export async function sendLineNotificationEvent(event) {
  const { data: bindings, error: bindingsError } = await supabase
    .from("line_bindings")
    .select("target_id, target_type")
    .eq("patient_id", event.patient_id)
    .eq("status", "active");

  if (bindingsError) {
    throw bindingsError;
  }

  if (bindings.length === 0) {
    return {
      sent: false,
      bindingCount: 0,
      error: "No active LINE bindings",
    };
  }

  try {
    await Promise.all(bindings.map((binding) => pushLineMessage(binding.target_id, event.message)));
    await supabase
      .from("notification_events")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", event.id);

    return {
      sent: true,
      bindingCount: bindings.length,
      error: null,
    };
  } catch (error) {
    await supabase
      .from("notification_events")
      .update({ status: "failed" })
      .eq("id", event.id);

    return {
      sent: false,
      bindingCount: bindings.length,
      error: error.message,
    };
  }
}
