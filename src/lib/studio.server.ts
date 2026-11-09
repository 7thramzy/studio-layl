import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PublicTrack = {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  featured: boolean;
  audioUrl: string | null;
  artist: string;
  versions: string[];
  youtubeUrl: string | null;
  lyrics: string;
  plays: number;
};

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export async function loadTracks(): Promise<PublicTrack[]> {
  const { data, error } = await publicClient()
    .from("tracks")
    .select(
      "id,title,category,duration,description,featured,audio_path,artist,versions,youtube_url,lyrics,plays",
    )
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load works");
  const paths = data.map((t) => t.audio_path).filter((p): p is string => !!p);
  const urls = new Map<string, string>();
  if (paths.length) {
    // Audio lives in a private bucket; only paths attached to published works get short-lived links.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed } = await supabaseAdmin.storage
      .from("track-audio")
      .createSignedUrls(paths, 60 * 60 * 6);
    for (const s of signed ?? []) if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
  }
  return data.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    duration: t.duration,
    description: t.description,
    featured: t.featured,
    artist: t.artist,
    versions: t.versions,
    youtubeUrl: t.youtube_url,
    lyrics: t.lyrics,
    plays: t.plays,
    audioUrl: t.audio_path ? (urls.get(t.audio_path) ?? null) : null,
  }));
}
