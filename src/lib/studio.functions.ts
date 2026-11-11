import { createServerFn } from "@tanstack/react-start";
import { loadTracks } from "./studio.server";

export const listTracks = createServerFn({ method: "GET" }).handler(async () => loadTracks());

const words = (value: string) =>
  value
    .toLocaleLowerCase("ar")
    .split(/[\s،؛,.!?]+/)
    .filter((word) => word.length > 2);

const localReason = (mood: string, trackText: string) => {
  const requested = new Set(words(mood));
  const matched = words(trackText).filter((word) => requested.has(word));
  return matched.length
    ? `يلتقي هذا العمل مع وصفك في ${matched.slice(0, 2).join(" و")}.`
    : "إحساسه قريب من الأجواء التي وصفتها، ويستحق أن يكون ضمن اختياراتك.";
};

export const recommendTracks = createServerFn({ method: "POST" })
  .inputValidator((input: { mood: string }) => {
    const mood = String(input?.mood ?? "").trim();
    if (mood.length < 3 || mood.length > 500) throw new Error("Invalid mood");
    return { mood };
  })
  .handler(async ({ data }) => {
    const tracks = await loadTracks();
    const requested = new Set(words(data.mood));
    const ranked = tracks
      .map((track) => {
        const text = `${track.title} ${track.category} ${track.artist} ${track.description}`;
        const score = words(text).reduce((total, word) => total + (requested.has(word) ? 1 : 0), 0);
        return { track, score };
      })
      .sort(
        (a, b) =>
          b.score - a.score ||
          Number(b.track.featured) - Number(a.track.featured) ||
          b.track.plays - a.track.plays,
      )
      .slice(0, 3);

    return {
      message: ranked.some((item) => item.score > 0)
        ? "اخترنا لك أعمالًا قريبة من الإحساس الذي وصفته."
        : "هذه اختياراتنا الأقرب من مكتبة الاستوديو.",
      picks: ranked.map(({ track }) => ({
        id: track.id,
        reason: localReason(
          data.mood,
          `${track.title} ${track.category} ${track.artist} ${track.description}`,
        ),
      })),
      error: null,
    };
  });
