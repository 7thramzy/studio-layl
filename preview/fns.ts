import { db } from "./supabase";

export const listTracks = async () =>
  db.tracks.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    duration: t.duration,
    description: t.description,
    featured: t.featured,
    audioUrl: null,
    artist: t.artist,
    versions: t.versions,
    youtubeUrl: t.youtube_url,
    lyrics: t.lyrics,
    plays: t.plays,
  }));

export const recommendTracks = async ({ data }: { data: { mood: string } }) => ({
  message: "اخترنا لك ما يناسب: " + data.mood,
  picks: [{ id: db.tracks[0].id, reason: "هادئة وملكية تناسب الدخول." }],
  error: null,
});
