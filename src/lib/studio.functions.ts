import { createServerFn } from "@tanstack/react-start";
import { GatewayError, generateResponse } from "@lovable.dev/ai-gateway";
import { loadTracks } from "./studio.server";

export const listTracks = createServerFn({ method: "GET" }).handler(async () => loadTracks());

export const recommendTracks = createServerFn({ method: "POST" })
  .inputValidator((input: { mood: string }) => {
    const mood = String(input?.mood ?? "").trim();
    if (mood.length < 3 || mood.length > 500) throw new Error("Invalid mood");
    return { mood };
  })
  .handler(async ({ data }) => {
    const tracks = await loadTracks();
    const catalog = tracks.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      description: t.description,
    }));
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions:
          "أنت مستشار فني في استوديو ليل للزفات والشيلات. اختر من الكتالوج المعطى فقط من 1 إلى 3 أعمال تناسب وصف الزائر، واكتب لكل عمل سبباً قصيراً ودافئاً بالعربية (جملة واحدة)، ثم رسالة ختامية قصيرة. لا تخترع أعمالاً غير موجودة.",
        input: `الكتالوج:\n${JSON.stringify(catalog)}\n\nوصف الزائر:\n${data.mood}`,
        text: {
          format: {
            type: "json_schema",
            name: "recommendations",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["picks", "message"],
              properties: {
                message: { type: "string" },
                picks: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["id", "reason"],
                    properties: { id: { type: "string" }, reason: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      });
      const text = res.output
        .flatMap((o) => (o.type === "message" ? o.content : []))
        .map((c) => (c.type === "output_text" ? c.text : ""))
        .join("");
      const parsed = JSON.parse(text) as {
        message: string;
        picks: { id: string; reason: string }[];
      };
      const ids = new Set(tracks.map((t) => t.id));
      return {
        message: parsed.message,
        picks: parsed.picks.filter((p) => ids.has(p.id)).slice(0, 3),
        error: null,
      };
    } catch (e) {
      if (e instanceof GatewayError) console.error("recommendTracks", e.code, e.ids);
      else console.error("recommendTracks", e);
      return {
        message: "",
        picks: [],
        error: "تعذر الحصول على اقتراحات الآن، حاول مرة أخرى بعد قليل.",
      };
    }
  });
