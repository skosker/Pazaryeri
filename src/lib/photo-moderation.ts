/**
 * Automated check for a freshly uploaded profile photo, run once at upload time.
 *
 * Same "configure it or skip it" shape as the Pexels/PayTR integrations: with no
 * ANTHROPIC_API_KEY the upload just goes live unchecked rather than failing, and any
 * error talking to the API fails the same way — a moderation hiccup must never be the
 * reason a real user cannot have a profile photo. The one thing this never does is turn
 * a request error into a false "flagged": that would hide someone's photo from the site
 * over a network blip, which is worse than letting an occasional bad photo through
 * unchecked until the next admin pass catches it another way.
 */

const MODEL = "claude-haiku-4-5-20251001";

const PROMPT =
  "Bu görsel bir serbest çalışma pazaryerinde kullanıcı profil fotoğrafı olarak " +
  "yüklendi. Görseli yalnızca şu açılardan değerlendir: çıplaklık/cinsel içerik, " +
  "grafik şiddet veya kan, nefret sembolleri, ya da bariz şekilde uygunsuz/rahatsız " +
  "edici başka bir içerik. Sıradan bir kişi fotoğrafı, logo, çizim ya da manzara " +
  "uygunsuz DEĞİLDİR. Yalnızca şu JSON ile cevap ver, başka hiçbir şey yazma: " +
  '{"flagged": true veya false, "reason": "kısa Türkçe gerekçe, uygunsuz değilse boş string"}';

export type ModerationResult = { checked: boolean; flagged: boolean; reason?: string };

export function hasModerationKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function parseResponse(text: string): { flagged: boolean; reason?: string } | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as { flagged?: unknown; reason?: unknown };
    if (typeof parsed.flagged !== "boolean") return null;
    return {
      flagged: parsed.flagged,
      reason: typeof parsed.reason === "string" && parsed.reason.trim() ? parsed.reason.trim() : undefined,
    };
  } catch {
    return null;
  }
}

export async function moderateProfilePhoto(buffer: Buffer, mimeType: string): Promise<ModerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { checked: false, flagged: false };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mimeType, data: buffer.toString("base64") } },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });

    if (!response.ok) return { checked: false, flagged: false };

    const body = (await response.json()) as { content?: { type: string; text?: string }[] };
    const text = body.content?.find((block) => block.type === "text")?.text;
    if (!text) return { checked: false, flagged: false };

    const parsed = parseResponse(text);
    if (!parsed) return { checked: false, flagged: false };

    return { checked: true, ...parsed };
  } catch {
    return { checked: false, flagged: false };
  }
}
