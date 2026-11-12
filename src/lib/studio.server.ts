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

const DEMO_TRACKS: PublicTrack[] = [
  {
    id: "demo-zaffa-layali",
    title: "زفة ليالي العمر",
    category: "زفات",
    duration: "03:18",
    description: "إحساس ملكي هادئ لبداية ليلة لا تُنسى.",
    featured: true,
    audioUrl: null,
    artist: "استوديو ليل",
    versions: ["daf", "full"],
    youtubeUrl: null,
    lyrics: "ليلة فرح تضيء بالحب والتهاني...",
    plays: 248,
  },
  {
    id: "demo-shilat-fakhr",
    title: "شيلة يوم الفخر",
    category: "شيلات",
    duration: "02:42",
    description: "إيقاع حماسي يرفع صوت الإنجاز ويحتفي بالوصول.",
    featured: true,
    audioUrl: null,
    artist: "استوديو ليل",
    versions: ["full", "pure"],
    youtubeUrl: null,
    lyrics: "هذا يوم الفخر والفرحة لها عنوان...",
    plays: 196,
  },
  {
    id: "demo-welcome-naghma",
    title: "نغمة الترحيب",
    category: "مخصص",
    duration: "02:56",
    description: "ترحيب دافئ يفتح المناسبة بإيقاع أنيق ومتزن.",
    featured: false,
    audioUrl: null,
    artist: "استوديو ليل",
    versions: ["daf", "pure"],
    youtubeUrl: null,
    lyrics: "يا هلا بمن حضر، يا مرحبًا بالفرح...",
    plays: 137,
  },
];

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
  try {
    const { data, error } = await publicClient()
      .from("tracks")
      .select(
        "id,title,category,duration,description,featured,audio_path,artist,versions,youtube_url,lyrics,plays",
      )
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (error || !data?.length) return DEMO_TRACKS;
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
  } catch {
    return DEMO_TRACKS;
  }
}
