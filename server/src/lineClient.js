import crypto from "node:crypto";

const LINE_API_URL = "https://api.line.me/v2/bot/message/push";

export function verifyLineSignature(rawBody, signature) {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelSecret || !signature) {
    return false;
  }

  const digest = crypto
    .createHmac("sha256", channelSecret)
    .update(rawBody)
    .digest("base64");

  const digestBuffer = Buffer.from(digest);
  const signatureBuffer = Buffer.from(signature);

  return digestBuffer.length === signatureBuffer.length
    && crypto.timingSafeEqual(digestBuffer, signatureBuffer);
}

export async function pushLineMessage(to, text) {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!channelAccessToken) {
    throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN");
  }

  const response = await fetch(LINE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      to,
      messages: [
        {
          type: "text",
          text,
        },
      ],
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`LINE push failed (${response.status}): ${responseText}`);
  }
}
