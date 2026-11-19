const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 6000;

function isLocalOrigin(origin) {
  try {
    const url = new URL(origin);
    return url.protocol === "http:"
      && ["127.0.0.1", "localhost"].includes(url.hostname);
  } catch {
    return false;
  }
}

function corsHeaders(origin) {
  const allowedOrigin = isLocalOrigin(origin) ? origin : "null";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "null";
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname !== "/api/chat" || request.method !== "POST") {
      return json({ error: "Rute tidak tersedia." }, 404, origin);
    }

    if (!env.GEMINI_API_KEY) {
      return json({ error: "API key belum diatur. Isi GEMINI_API_KEY di .dev.vars." }, 503, origin);
    }

    let input;
    try {
      input = await request.json();
    } catch {
      return json({ error: "Format pesan tidak valid." }, 400, origin);
    }

    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return json({ error: "Format pesan tidak valid." }, 400, origin);
    }

    const systemInstruction = typeof input.systemInstruction === "string"
      ? input.systemInstruction.slice(0, 12000)
      : "Jawab dalam Bahasa Indonesia dengan jelas dan ramah.";
    const messages = Array.isArray(input.messages)
      ? input.messages.slice(-MAX_MESSAGES)
      : [];
    const contents = messages
      .filter((item) => item && ["user", "model"].includes(item.role))
      .map((item) => ({
        role: item.role,
        parts: [{
          text: typeof item.text === "string"
            ? item.text.slice(0, MAX_MESSAGE_LENGTH)
            : "",
        }],
      }))
      .filter((item) => item.parts[0].text.trim());

    if (!contents.length || contents.at(-1).role !== "user") {
      return json({ error: "Pesan pengguna belum tersedia." }, 400, origin);
    }

    const allowedModels = new Set([
      "gemini-3.8-flash",
      "gemini-3.1-pro-preview",
      "gemini-3.5-flash-lite",
    ]);
    const defaultModel = allowedModels.has(env.GEMINI_MODEL)
      ? env.GEMINI_MODEL
      : "gemini-3.8-flash";
    const model = allowedModels.has(input.model) ? input.model : defaultModel;
    const endpoint = new URL(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
    );
    endpoint.searchParams.set("key", env.GEMINI_API_KEY);

    let upstream;
    try {
      upstream = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
        }),
      });
    } catch {
      return json({ error: "Tidak bisa terhubung ke Gemini. Coba lagi sebentar." }, 502, origin);
    }

    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return json({
        error: result.error?.message || `Gemini merespons dengan status ${upstream.status}.`,
      }, upstream.status === 429 ? 429 : 502, origin);
    }

    const text = result.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      return json({ error: "Gemini belum memberikan jawaban teks." }, 502, origin);
    }

    return json({ text }, 200, origin);
  },
};
