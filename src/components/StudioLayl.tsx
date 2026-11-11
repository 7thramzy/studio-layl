import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { listTracks, recommendTracks } from "@/lib/studio.functions";
import type { Database } from "@/integrations/supabase/types";
import type { PublicTrack } from "@/lib/studio.server";
import {
  AudioLines,
  Search,
  Sun,
  Moon,
  Heart,
  Play,
  Pause,
  Sparkles,
  Menu,
  X,
  ArrowUpLeft,
  Plus,
  Trash2,
  Music2,
  MessageCircle,
  Clock3,
  CheckCircle2,
  Upload,
  Wand2,
  LogOut,
  SkipBack,
  SkipForward,
  Share2,
  ScrollText,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
type Track = PublicTrack;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const waNum = (p: string) => {
  const d = p.replace(/\D/g, "");
  return d.startsWith("0") ? "966" + d.slice(1) : d;
};

const VL: Record<string, string> = {
  fx: "بدون موسيقى",
  daf: "إيقاع ودف",
  full: "موسيقى كاملة",
  pure: "صافي",
};
const ADDS = ["كتابة قصيدة خاصة", "إلقاء شعري في المقدمة", "مونتاج فيديو 4K", "تسليم مستعجل VIP"];
const MOODS = ["الكل", "هادئ", "حماسي", "فخم", "ترحيبي", "عاطفي"];
const CONTACTS: [string, string, string][] = [
  ["واتساب داخل المملكة", "0505174857", "tel:0505174857"],
  ["واتساب خارج المملكة", "+966505174857", "https://wa.me/966505174857"],
  ["يوتيوب", "@studio-layl", "https://www.youtube.com/@studio-layl"],
  ["إنستغرام", "@zafat05", "https://www.instagram.com/zafat05"],
  ["تيك توك", "@lm.2500", "https://www.tiktok.com/@lm.2500"],
  ["البريد الإلكتروني", "lm-layl@hotmail.com", "mailto:lm-layl@hotmail.com"],
  ["البريد الإلكتروني", "layl-alamisiat@outlook.com", "mailto:layl-alamisiat@outlook.com"],
  [
    "البريد الإلكتروني",
    "zafaat-layl-alamisiat@hotmail.com",
    "mailto:zafaat-layl-alamisiat@hotmail.com",
  ],
];
// Synthesized preview used until a real audio file is uploaded for a work.
let ac: AudioContext | undefined,
  tmr = 0,
  stp = 0;
const tone = (f: number, d: number, ty: OscillatorType, v: number) => {
  const a = ac!,
    t = a.currentTime + 0.02,
    o = a.createOscillator(),
    g = a.createGain();
  o.type = ty;
  o.frequency.value = f;
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + d);
};
const stopSynth = () => window.clearInterval(tmr);
const startSynth = (m: string) => {
  stopSynth();
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ac = ac || new AC();
  void ac.resume();
  stp = 0;
  const N = [220, 261.6, 329.6, 392, 329.6, 261.6, 293.7, 246.9];
  const b = () => {
    const k = stp++ % 16;
    if (m === "fx") {
      if (k % 8 === 0) tone((N[(k / 2) | 0] ?? 220) * 2, 1.4, "sine", 0.07);
      return;
    }
    if (k % 4 === 0) tone(70, 0.25, "sine", 0.35);
    if (k % 8 === 4 || k === 14) tone(1800, 0.07, "square", 0.05);
    if (m === "pure" && k % 8 === 0) tone(220, 0.6, "sine", 0.05);
    if (m === "full") {
      if (k % 2 === 0) tone(N[(k / 2) | 0] ?? 220, 0.35, "triangle", 0.08);
      if (k % 8 === 0) tone(110, 0.9, "sawtooth", 0.04);
    }
  };
  b();
  tmr = window.setInterval(b, 200);
};
const WHATSAPP_NUMBER = "966505174857";
const makeOrderCode = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LAYL-${date}-${suffix}`;
};
const moodOf = (t: Track) => {
  const text = `${t.title} ${t.description} ${t.category}`;
  if (/ترحيب|عرضة|فخر|حماس|شيلة/i.test(text)) return "حماسي";
  if (/فخم|مهابة|ملكة|كوشة/i.test(text)) return "فخم";
  if (/هادئ|تحرس|رقيق|ناعم/i.test(text)) return "هادئ";
  if (/عاطف|ذكرى|إهداء|حب/i.test(text)) return "عاطفي";
  return "ترحيبي";
};
const greeting = () => {
  const h = new Date().getHours();
  return h < 12
    ? "صباح يحمل لكم بداية جميلة"
    : h < 17
      ? "مساء يليق بتفاصيلكم"
      : "ليلتكم أجمل مع استوديو ليل";
};
const HERO_SLIDES = [
  {
    kicker: "زفات الزواج",
    title: "صوت يليق ببداية الحكاية.",
    body: "اختاروا الإحساس، واتركوا لنا صناعة التفاصيل التي تبقى معكم بعد انتهاء الليلة.",
    cta: "استكشف زفات الزواج",
    filter: "زفات",
  },
  {
    kicker: "شيلات التخرج",
    title: "لحظة الوصول لها نغمتها.",
    body: "إيقاع يرفع الفخر، وكلمات تحمل اسم صاحب الإنجاز كما تستحق اللحظة.",
    cta: "استمع إلى الشيلات",
    filter: "شيلات",
  },
  {
    kicker: "عمل يحمل اسمكم",
    title: "حكاية لا تشبه غيرها.",
    body: "من أول فكرة إلى النسخة التي تفتحونها في مناسبتكم، نصنع العمل حول تفاصيلكم.",
    cta: "ابدأ طلبًا مخصصًا",
    filter: "مخصص",
  },
] as const;
export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("layl-theme") as "dark" | "light") || "dark",
  );
  const fetchTracks = useServerFn(listTracks);
  const { data: tracks = [], isLoading: loadingTracks } = useQuery({
    queryKey: ["tracks"],
    queryFn: () => fetchTracks(),
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("layl-favorites") || "[]");
    } catch {
      return [];
    }
  });
  const [category, setCategory] = useState("الكل"),
    [search, setSearch] = useState(""),
    [artistFilter, setArtistFilter] = useState("الكل"),
    [moodFilter, setMoodFilter] = useState("الكل"),
    [sortBy, setSortBy] = useState("featured"),
    [playing, setPlaying] = useState<string | null>(null),
    [onlyFav, setOnlyFav] = useState(false),
    [request, setRequest] = useState(false),
    [admin, setAdmin] = useState(false),
    [menu, setMenu] = useState(false),
    [toast, setToast] = useState(""),
    [dock, setDock] = useState<string | null>(null),
    [dockExpanded, setDockExpanded] = useState(true),
    [mode, setMode] = useState("fx"),
    [ver, setVer] = useState("all"),
    [preset, setPreset] = useState(""),
    [time, setTime] = useState(0),
    [dur, setDur] = useState(0),
    [lyricsFor, setLyricsFor] = useState<Track | null>(null),
    [detailsFor, setDetailsFor] = useState<Track | null>(null);
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [waveforms, setWaveforms] = useState<Record<string, number[]>>({});
  const audio = useRef<HTMLAudioElement>(null),
    tk = useRef(0),
    deep = useRef(false),
    waveformBusy = useRef(new Set<string>());
  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
    localStorage.setItem("layl-theme", theme);
  }, [theme]);
  useEffect(() => localStorage.setItem("layl-favorites", JSON.stringify(favorites)), [favorites]);
  useEffect(() => {
    if (heroPaused) return;
    const timer = window.setInterval(
      () => setHeroSlide((current) => (current + 1) % HERO_SLIDES.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, [heroPaused]);
  const artists = useMemo(() => ["الكل", ...new Set(tracks.map((t) => t.artist))], [tracks]);
  const visible = useMemo(() => {
    const filtered = tracks.filter(
      (t) =>
        (category === "الكل" || t.category === category) &&
        (ver === "all" || t.versions.includes(ver)) &&
        (artistFilter === "الكل" || t.artist === artistFilter) &&
        (moodFilter === "الكل" || moodOf(t) === moodFilter) &&
        (!onlyFav || favorites.includes(t.id)) &&
        `${t.title} ${t.artist} ${t.description}`.toLowerCase().includes(search.toLowerCase()),
    );
    return [...filtered].sort((a, b) => {
      if (sortBy === "plays") return b.plays - a.plays;
      if (sortBy === "title") return a.title.localeCompare(b.title, "ar");
      if (sortBy === "newest") return b.id.localeCompare(a.id);
      return Number(b.featured) - Number(a.featured);
    });
  }, [tracks, category, onlyFav, favorites, search, ver, artistFilter, moodFilter, sortBy]);
  const notify = (s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(""), 2800);
  };
  const copy = async (v: string) => {
    try {
      await navigator.clipboard.writeText(v);
      notify("تم النسخ: " + v);
    } catch {
      notify("تعذّر النسخ، انسخه يدوياً");
    }
  };
  const stop = () => {
    stopSynth();
    window.clearInterval(tk.current);
    audio.current?.pause();
    setPlaying(null);
  };
  const start = (t: Track, m: string) => {
    stop();
    setDock(t.id);
    setTime(0);
    setDur(0);
    void supabase.rpc("increment_plays", { track_id: t.id }).then(() => undefined);
    if (t.audioUrl && audio.current) {
      void loadWaveform(t);
      audio.current.src = t.audioUrl;
      const savedPosition = Number(localStorage.getItem(`layl-position-${t.id}`) || 0);
      if (savedPosition > 0) audio.current.currentTime = savedPosition;
      void audio.current
        .play()
        .then(() => setPlaying(t.id))
        .catch(() => notify("تعذر تشغيل الملف؛ تحقق من المسار."));
    } else {
      startSynth(m);
      setDur(30);
      tk.current = window.setInterval(() => setTime((x) => Math.min(30, x + 0.25)), 250);
      setPlaying(t.id);
    }
  };
  const loadWaveform = async (t: Track) => {
    if (!t.audioUrl || waveforms[t.id] || waveformBusy.current.has(t.id)) return;
    waveformBusy.current.add(t.id);
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = ac || new AC();
      ac = context;
      const buffer = await fetch(t.audioUrl)
        .then((response) => response.arrayBuffer())
        .then((data) => context.decodeAudioData(data));
      const channel = buffer.getChannelData(0);
      const bars = 19;
      const size = Math.max(1, Math.floor(channel.length / bars));
      const values = Array.from({ length: bars }, (_, i) => {
        let peak = 0;
        for (let j = i * size; j < Math.min(channel.length, (i + 1) * size); j += 1)
          peak = Math.max(peak, Math.abs(channel[j]));
        return Math.max(18, Math.round(peak * 100));
      });
      setWaveforms((old) => ({ ...old, [t.id]: values }));
    } catch {
      notify("تعذر تجهيز الموجة الصوتية، ستستمر المعاينة بشكل طبيعي.");
    } finally {
      waveformBusy.current.delete(t.id);
    }
  };
  const pick = (t: Track) => {
    const m = t.versions.includes(mode) ? mode : t.versions[0] || "fx";
    setMode(m);
    start(t, m);
  };
  const play = (t: Track) => (playing === t.id ? stop() : pick(t));
  const step = (d: number) => {
    if (!visible.length) return;
    const k = visible.findIndex((x) => x.id === dock);
    const n = visible[(k + d + visible.length) % visible.length];
    if (n) pick(n);
  };
  const cur = tracks.find((t) => t.id === dock);
  const seek = (v: number) => {
    setTime(v);
    if (cur?.audioUrl && audio.current) audio.current.currentTime = v;
  };
  const share = (t: Track) =>
    copy(`${window.location.origin}${window.location.pathname}?work=${t.id}`);
  useEffect(() => {
    const w = new URLSearchParams(window.location.search).get("work");
    if (!w || deep.current || !tracks.some((t) => t.id === w)) return;
    deep.current = true;
    setDock(w);
    window.setTimeout(() => {
      const work = document.getElementById("w-" + w);
      if (work) window.scrollTo({ top: work.offsetTop - 80, behavior: "smooth" });
    }, 300);
  }, [tracks]);
  const order = (t?: Track) => {
    setPreset(t ? t.title : "");
    setRequest(true);
  };
  return (
    <div className="shell">
      <audio
        ref={audio}
        onEnded={() => setPlaying(null)}
        onTimeUpdate={(e) => {
          setTime(e.currentTarget.currentTime);
          setDur(e.currentTarget.duration || 0);
          if (cur?.id && e.currentTarget.currentTime > 0)
            localStorage.setItem(`layl-position-${cur.id}`, String(e.currentTarget.currentTime));
        }}
      />
      <header className="top">
        <a className="brand" href="#home">
          <img
            className="brand-logo"
            src="/logo.webp"
            alt="شعار ليل الأمسيات"
            width={44}
            height={44}
          />
          <span>
            <b>ليل الأمسيات</b>
            <small>زفات وشيلات</small>
          </span>
        </a>
        <nav className={menu ? "nav open" : "nav"}>
          <a href="#home" onClick={() => setMenu(false)}>
            الرئيسية
          </a>
          <a href="#library" onClick={() => setMenu(false)}>
            الأعمال
          </a>
          <a href="#about" onClick={() => setMenu(false)}>
            عن الاستوديو
          </a>
          <a href="#contact" onClick={() => setMenu(false)}>
            تواصل
          </a>
          <button
            className="nav-cta"
            onClick={() => {
              setRequest(true);
              setMenu(false);
            }}
          >
            اطلب زفتك <ArrowUpLeft size={15} />
          </button>
        </nav>
        <div className="top-actions">
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="تبديل المظهر"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
          <button className="icon-btn mobile" onClick={() => setMenu(!menu)} aria-label="القائمة">
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main>
        <section
          className="hero hero-carousel"
          id="home"
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
        >
          <div className="hero-copy">
            <div className="eyebrow">
              <i /> {HERO_SLIDES[heroSlide].kicker}
            </div>
            <p className="greeting">{greeting()}</p>
            <div className="hero-slide-copy" key={heroSlide}>
              <h1>{HERO_SLIDES[heroSlide].title}</h1>
              <p className="lead">{HERO_SLIDES[heroSlide].body}</p>
            </div>
            <div className="hero-actions">
              <button
                className="gold-btn"
                onClick={() => {
                  if (HERO_SLIDES[heroSlide].filter === "مخصص") setRequest(true);
                  else {
                    setCategory(HERO_SLIDES[heroSlide].filter);
                    const library = document.querySelector<HTMLElement>("#library");
                    if (library)
                      window.scrollTo({ top: library.offsetTop - 24, behavior: "smooth" });
                  }
                }}
              >
                {HERO_SLIDES[heroSlide].cta} <ArrowUpLeft size={17} />
              </button>
              <a href="#library" className="listen">
                <span>
                  <Play size={12} fill="currentColor" />
                </span>
                استمع إلى أعمالنا
              </a>
            </div>
            <div className="hero-meta">
              <span>
                <Sparkles /> كتالوج صوتي يتجدد باستمرار
              </span>
              <i />
              <span>
                <AudioLines /> أعمال تُصنع حول مناسبتكم
              </span>
            </div>
          </div>
          <div className="hero-visual" aria-label="معاينة بصرية للشرائح">
            <picture className="hero-visual-picture">
              <source media="(max-width: 650px)" srcSet="/logo.webp" />
              <img
                className="hero-visual-image"
                src="/banner-hero.webp"
                alt="هوية استوديو ليل الصوتية"
                width={1800}
                height={298}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
            <div className="hero-visual-shade" />
            <div className="hero-visual-mark">
              <img src="/logo.webp" alt="شعار استوديو ليل" width={92} height={92} />
              <span>YOUR MOMENT / OUR SOUND</span>
            </div>
            <div className="hero-visual-caption">
              <span>استوديو ليل</span>
              <b>{String(heroSlide + 1).padStart(2, "0")}</b>
            </div>
          </div>
          <div className="hero-controls">
            <button
              className="hero-arrow"
              onClick={() =>
                setHeroSlide((current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
              }
              aria-label="الشريحة السابقة"
            >
              <ChevronRight size={18} />
            </button>
            <div className="hero-dots" role="tablist" aria-label="شرائح الواجهة">
              {HERO_SLIDES.map((slide, index) => (
                <button
                  key={slide.kicker}
                  className={heroSlide === index ? "hero-dot active" : "hero-dot"}
                  onClick={() => setHeroSlide(index)}
                  aria-label={`الشريحة ${index + 1}`}
                  aria-selected={heroSlide === index}
                  role="tab"
                />
              ))}
            </div>
            <button
              className="hero-arrow"
              onClick={() => setHeroSlide((current) => (current + 1) % HERO_SLIDES.length)}
              aria-label="الشريحة التالية"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </section>
        <Recommender tracks={tracks} play={play} playing={playing} />
        <section className="section" id="library">
          <div className="section-head">
            <div>
              <div className="eyebrow">
                <i /> مكتبة الاستوديو
              </div>
              <h2>
                أعمال تلامس <em>الإحساس</em>
              </h2>
            </div>
            <p>استكشف نماذج من أعمالنا، واختر الإحساس الأقرب إلى لحظتك.</p>
          </div>
          <div className="tools">
            <div className="tabs">
              {["الكل", "زفات", "شيلات", "مخصص"].map((c) => (
                <button
                  key={c}
                  className={category === c ? "tab active" : "tab"}
                  onClick={() => {
                    setCategory(c);
                    setOnlyFav(false);
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="tool-right">
              <button
                className={onlyFav ? "fav selected" : "fav"}
                onClick={() => setOnlyFav(!onlyFav)}
              >
                <Heart size={15} /> المفضلة
              </button>
              <label className="search">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن عمل..."
                />
              </label>
            </div>
          </div>
          <div className="vfilter">
            {([["all", "كل النسخ"], ...Object.entries(VL)] as [string, string][]).map(([k, l]) => (
              <button
                key={k}
                className={ver === k ? "tab active" : "tab"}
                onClick={() => setVer(k)}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="smart-filters" aria-label="مرشحات إضافية">
            <label>
              الإحساس
              <select value={moodFilter} onChange={(e) => setMoodFilter(e.target.value)}>
                {MOODS.map((mood) => (
                  <option key={mood}>{mood}</option>
                ))}
              </select>
            </label>
            <label>
              الفنان
              <select value={artistFilter} onChange={(e) => setArtistFilter(e.target.value)}>
                {artists.map((artist) => (
                  <option key={artist}>{artist}</option>
                ))}
              </select>
            </label>
            <label>
              ترتيب
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">اختيار الاستوديو</option>
                <option value="newest">الأحدث</option>
                <option value="plays">الأكثر استماعًا</option>
                <option value="title">أبجديًا</option>
              </select>
            </label>
          </div>
          <div className="cards">
            {visible.map((t, i) => (
              <article className="track" id={"w-" + t.id} key={t.id}>
                <div className="cover">
                  <div className={waveforms[t.id] ? "wave real" : "wave"}>
                    {(waveforms[t.id] ?? Array.from({ length: 19 }, () => null)).map(
                      (height, n) => (
                        <i key={n} style={height ? { height: `${height}%` } : undefined} />
                      ),
                    )}
                  </div>
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  <button className="play" onClick={() => play(t)} aria-label="تشغيل">
                    {playing === t.id ? (
                      <Pause fill="currentColor" />
                    ) : (
                      <Play fill="currentColor" />
                    )}
                  </button>
                  <button
                    className={favorites.includes(t.id) ? "heart liked" : "heart"}
                    onClick={() =>
                      setFavorites((old) =>
                        old.includes(t.id) ? old.filter((x) => x !== t.id) : [...old, t.id],
                      )
                    }
                    aria-label="المفضلة"
                  >
                    <Heart size={16} fill={favorites.includes(t.id) ? "currentColor" : "none"} />
                  </button>
                  {t.featured && <span className="featured">اختيار الاستوديو</span>}
                </div>
                <div className="track-info">
                  <div className="track-meta">
                    <span>{t.category}</span>
                    <span>
                      <Clock3 size={12} /> {t.duration}
                    </span>
                  </div>
                  <h3>{t.title}</h3>
                  <p>
                    {t.artist} — {t.description}
                  </p>
                  <div className="vtags">
                    {t.versions.map((v) => (
                      <span key={v}>{VL[v]}</span>
                    ))}
                  </div>
                  <div className="track-actions">
                    <button className="listen" onClick={() => setDetailsFor(t)}>
                      <Music2 size={13} /> التفاصيل
                    </button>
                    <button className="gold-btn" onClick={() => order(t)}>
                      خصّصه باسمك
                    </button>
                    {t.lyrics && (
                      <button className="listen" onClick={() => setLyricsFor(t)}>
                        <ScrollText size={13} /> الكلمات
                      </button>
                    )}
                    <button className="listen" onClick={() => void share(t)} aria-label="مشاركة">
                      <Share2 size={13} /> مشاركة
                    </button>
                    {t.youtubeUrl && (
                      <a
                        className="listen"
                        href={t.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        يوتيوب
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
            {loadingTracks && (
              <div className="empty">
                <Music2 />
                <b>جارٍ تحميل الأعمال...</b>
              </div>
            )}
            {!loadingTracks && visible.length === 0 && (
              <div className="empty">
                <Music2 />
                <b>لا توجد أعمال مطابقة</b>
                <span>جرّب تغيير البحث أو التصنيف.</span>
              </div>
            )}
          </div>
          <div className="library-foot">
            <span>نعمل على إضافة المزيد من الحكايات الصوتية</span>
            <span>{visible.length} أعمال معروضة</span>
          </div>
        </section>
        <section className="quote" id="about">
          <div>“</div>
          <p>
            ليست مجرد زفة؛ إنها نغمة تبقى
            <br />
            كلما عادت الذاكرة إلى تلك الليلة.
          </p>
          <small>استوديو ليل — نصنع صوت لحظتكم</small>
        </section>
        <section className="custom">
          <div className="custom-icon">
            <AudioLines />
          </div>
          <div>
            <div className="eyebrow">
              <i /> عمل يحمل اسمكم
            </div>
            <h2>حكايتكم لا تشبه غيرها.</h2>
            <p>أخبرونا بالتفاصيل، ونبدأ معكم بصناعة عمل صوتي يليق بالمناسبة.</p>
          </div>
          <button className="gold-btn" onClick={() => setRequest(true)}>
            ابدأ طلبك الآن <ArrowUpLeft />
          </button>
        </section>
        <Reviews />
        <section className="section" id="contact">
          <div className="section-head">
            <div>
              <div className="eyebrow">
                <i /> التواصل الرسمي
              </div>
              <h2>
                نصلكم <em>بسهولة</em>
              </h2>
            </div>
            <p>انسخ أي بيان بنقرة أو افتحه مباشرة.</p>
          </div>
          <div className="contacts">
            {CONTACTS.map(([l, v, h]) => (
              <div className="contact" key={v}>
                <span>
                  <small>{l}</small>
                  <a dir="ltr" href={h} target="_blank" rel="noopener noreferrer">
                    {v}
                  </a>
                </span>
                <button onClick={() => copy(v)}>نسخ</button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="footer">
        <a className="brand" href="#home">
          <img
            className="brand-logo"
            src="/logo.webp"
            alt="شعار ليل الأمسيات"
            width={44}
            height={44}
          />
          <span>
            <b>ليل الأمسيات</b>
            <small>زفات وشيلات</small>
          </span>
        </a>
        <span>© {new Date().getFullYear()} استوديو ليل. جميع الحقوق محفوظة.</span>
        <div>
          <a href="#library">الأعمال</a>
          <a href="#about">من نحن</a>
          <button onClick={() => setAdmin(true)}>الإدارة</button>
        </div>
      </footer>
      {cur && (
        <div className={dockExpanded ? "dock expanded" : "dock compact"}>
          <span className="dock-meta">
            <b>{cur.title}</b>
            <small>{cur.artist}</small>
          </span>
          <button
            className="dock-dismiss"
            onClick={() => {
              stop();
              setDock(null);
            }}
            aria-label="إغلاق المشغل"
          >
            <X size={16} />
          </button>
          <button
            className="dock-toggle"
            onClick={() => setDockExpanded((expanded) => !expanded)}
            aria-label={dockExpanded ? "تصغير المشغل" : "توسيع المشغل"}
          >
            {dockExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button className="icon-btn" onClick={() => step(-1)} aria-label="السابق">
            <SkipForward />
          </button>
          <button className="gold-btn" onClick={() => play(cur)} aria-label="تشغيل أو إيقاف">
            {playing === cur.id ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button className="icon-btn" onClick={() => step(1)} aria-label="التالي">
            <SkipBack />
          </button>
          <span className="dock-seek" dir="ltr">
            <small>{fmt(time)}</small>
            <input
              type="range"
              min={0}
              max={dur || 1}
              step={0.1}
              value={time}
              onChange={(e) => seek(+e.target.value)}
              aria-label="التقدم"
            />
            <small>{fmt(dur)}</small>
          </span>
          <span className="dock-vers">
            {cur.versions.map((v) => (
              <button
                key={v}
                className={mode === v ? "tab active" : "tab"}
                onClick={() => {
                  setMode(v);
                  if (playing === cur.id && !cur.audioUrl) startSynth(v);
                }}
              >
                {VL[v]}
              </button>
            ))}
          </span>
          <button className="gold-btn" onClick={() => order(cur)}>
            اطلب هذه باسمك
          </button>
        </div>
      )}
      {lyricsFor && (
        <div
          className="backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setLyricsFor(null)}
        >
          <div className="modal">
            <button className="close" onClick={() => setLyricsFor(null)} aria-label="إغلاق">
              <X />
            </button>
            <h2>{lyricsFor.title}</h2>
            <pre className="lyrics">{lyricsFor.lyrics}</pre>
          </div>
        </div>
      )}
      {detailsFor && (
        <TrackDetailsModal
          track={detailsFor}
          playing={playing === detailsFor.id}
          play={() => play(detailsFor)}
          order={() => order(detailsFor)}
          share={() => void share(detailsFor)}
          close={() => setDetailsFor(null)}
        />
      )}
      {request && <RequestModal preset={preset} close={() => setRequest(false)} />}
      {admin && <AdminModal tracks={tracks} close={() => setAdmin(false)} />}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
function TrackDetailsModal({
  track,
  playing,
  play,
  order,
  share,
  close,
}: {
  track: Track;
  playing: boolean;
  play: () => void;
  order: () => void;
  share: () => void;
  close: () => void;
}) {
  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="modal track-details-modal">
        <button className="close" onClick={close} aria-label="إغلاق">
          <X />
        </button>
        <div className="eyebrow">
          <i /> تفاصيل العمل
        </div>
        <h2>{track.title}</h2>
        <p className="detail-artist">{track.artist}</p>
        <div className="detail-meta">
          <span>{track.category}</span>
          <span>{moodOf(track)}</span>
          <span>{track.duration}</span>
          <span>{track.plays} تشغيل</span>
        </div>
        <p className="intro">{track.description}</p>
        <div className="detail-versions">
          {track.versions.map((version) => (
            <span key={version}>{VL[version]}</span>
          ))}
        </div>
        <div className="detail-actions">
          <button className="gold-btn" onClick={play}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
            {playing ? "إيقاف المعاينة" : "استمع إلى المعاينة"}
          </button>
          <button className="listen" onClick={share}>
            <Share2 size={14} /> مشاركة
          </button>
          <button className="listen" onClick={order}>
            <MessageCircle size={14} /> اطلبها باسمك
          </button>
        </div>
        {track.lyrics && (
          <div className="detail-lyrics">
            <b>لمحة من الكلمات</b>
            <pre>{track.lyrics}</pre>
          </div>
        )}
        <small className="note">لا توجد أسعار داخل المنصة؛ نكمل التفاصيل عبر واتساب.</small>
      </div>
    </div>
  );
}
function RequestModal({ close, preset }: { close: () => void; preset: string }) {
  const [name, setName] = useState(""),
    [type, setType] = useState("زفة"),
    [occasion, setOccasion] = useState(""),
    [date, setDate] = useState(""),
    [details, setDetails] = useState(preset ? "مرجع: " + preset : ""),
    [phone, setPhone] = useState(""),
    [ver, setVer] = useState(VL["daf"] ?? "إيقاع ودف"),
    [adds, setAdds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [savedCode, setSavedCode] = useState("");
  const send = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    setError("");
    const orderCode = makeOrderCode();
    const savedDetails = `رقم الطلب: ${orderCode}\n${details}`;
    const { error: saveError } = await supabase.from("orders").insert({
      name: name.trim(),
      work_type: type,
      occasion,
      event_date: date || null,
      details: savedDetails,
      version: ver,
      addons: adds,
      reference: preset,
      phone: phone.trim(),
    });
    if (saveError) {
      setSaving(false);
      setError("تعذر حفظ الطلب الآن. لم يتم فتح واتساب، حاول مرة أخرى.");
      return;
    }
    const msg = `طلب جديد من موقع استوديو ليل\nرقم الطلب: ${orderCode}\nالاسم: ${name}\nنوع العمل: ${type}\nالمناسبة: ${occasion}\nالتاريخ: ${date || "غير محدد"}\nالجوال: ${phone || "غير محدد"}\nالنسخة: ${ver}\nالإضافات: ${adds.join("، ") || "لا يوجد"}\nالتفاصيل: ${details}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    const whatsappWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!whatsappWindow) window.location.assign(whatsappUrl);
    setSavedCode(orderCode);
    setSaving(false);
  };
  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="modal">
        <button className="close" onClick={close}>
          <X />
        </button>
        <div className="eyebrow">
          <i /> طلب مخصص
        </div>
        <h2>لنبدأ حكايتكم.</h2>
        <p className="intro">كلما كانت التفاصيل أوضح، اقتربنا أكثر من العمل الذي تتخيلونه.</p>
        <div className="form">
          <label>
            الاسم
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك الكريم"
            />
          </label>
          <label>
            نوع العمل
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option>زفة</option>
              <option>شيلة</option>
              <option>إهداء صوتي</option>
              <option>موسيقى خاصة</option>
            </select>
          </label>
          <label>
            المناسبة
            <input
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="مثلاً: زفاف"
            />
          </label>
          <label>
            تاريخ المناسبة
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            رقم الجوال (اختياري)
            <input
              dir="ltr"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
            />
          </label>
          <label>
            النسخة الصوتية
            <select value={ver} onChange={(e) => setVer(e.target.value)}>
              {Object.values(VL).map((l) => (
                <option key={l}>{l}</option>
              ))}
              <option>نسختان معاً</option>
            </select>
          </label>
          <div className="wide adds">
            {ADDS.map((a) => (
              <button
                type="button"
                key={a}
                className={adds.includes(a) ? "tab active" : "tab"}
                onClick={() =>
                  setAdds((o) => (o.includes(a) ? o.filter((x) => x !== a) : [...o, a]))
                }
              >
                {a}
              </button>
            ))}
          </div>
          <label className="wide">
            التفاصيل
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="الأسماء، الأسلوب، الإيقاع، وأي تفاصيل تحب إضافتها..."
            />
          </label>
        </div>
        <button
          className="gold-btn submit"
          disabled={!name.trim() || saving || !!savedCode}
          onClick={() => void send()}
        >
          {saving ? "جارٍ حفظ الطلب..." : savedCode ? "تم حفظ الطلب" : "إرسال الطلب عبر واتساب"}{" "}
          <MessageCircle />
        </button>
        {savedCode && (
          <div className="order-confirmation" role="status">
            <CheckCircle2 size={18} />
            <span>
              تم حفظ طلبكم برقم <bdi dir="ltr">{savedCode}</bdi>، وتم تجهيز رسالة واتساب.
            </span>
          </div>
        )}
        {error && (
          <small className="form-error" role="alert">
            {error}
          </small>
        )}
        <small className="note">
          سيُحفظ الطلب أولًا، ثم يفتح واتساب برسالة جاهزة لمراجعتها وإرسالها.
        </small>
      </div>
    </div>
  );
}
function Recommender({
  tracks,
  play,
  playing,
}: {
  tracks: Track[];
  play: (t: Track) => void;
  playing: string | null;
}) {
  const recommend = useServerFn(recommendTracks);
  const [mood, setMood] = useState(""),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState<{
      message: string;
      picks: { id: string; reason: string }[];
    } | null>(null),
    [error, setError] = useState("");
  const ask = async () => {
    setBusy(true);
    setError("");
    try {
      const r = await recommend({ data: { mood } });
      if (r.error) setError(r.error);
      else setResult({ message: r.message, picks: r.picks });
    } catch {
      setError("تعذر الحصول على اقتراحات الآن، حاول مرة أخرى بعد قليل.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="section ai-match" id="match">
      <div className="section-head">
        <div>
          <div className="eyebrow">
            <i /> مستشار ليل
          </div>
          <h2>
            صف لنا <em>لحظتك</em>
          </h2>
        </div>
        <p>اكتب المناسبة أو الإحساس الذي تتخيله، وسنقترح لك الأعمال الأقرب إليه.</p>
      </div>
      <div className="ai-box">
        <textarea
          value={mood}
          maxLength={500}
          onChange={(e) => setMood(e.target.value)}
          placeholder="مثلاً: دخول العروس بهدوء ورقي، أجواء عائلية دافئة..."
        />
        <button className="gold-btn" disabled={busy || mood.trim().length < 3} onClick={ask}>
          {busy ? "جارٍ الاختيار..." : "اقترح لي"} <Wand2 size={16} />
        </button>
      </div>
      {error && <p className="ai-error">{error}</p>}
      {result && (
        <div className="ai-results">
          {result.message && <p className="ai-message">{result.message}</p>}
          {result.picks.length === 0 && (
            <p className="ai-message">لم نجد عملاً مطابقاً، اطلب زفتك الخاصة.</p>
          )}
          {result.picks.map((p) => {
            const t = tracks.find((x) => x.id === p.id);
            if (!t) return null;
            return (
              <div className="ai-pick" key={p.id}>
                <button className="play" onClick={() => play(t)} aria-label="تشغيل">
                  {playing === t.id ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                </button>
                <div>
                  <b>{t.title}</b> <small>{t.category}</small>
                  <span>{p.reason}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

const fmtDuration = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.round(sec % 60)).padStart(2, "0")}`;
const readDuration = (file: File) =>
  new Promise<string>((resolve) => {
    const a = new Audio();
    const url = URL.createObjectURL(file);
    a.preload = "metadata";
    a.onloadedmetadata = () => {
      resolve(Number.isFinite(a.duration) ? fmtDuration(a.duration) : "—");
      URL.revokeObjectURL(url);
    };
    a.onerror = () => resolve("—");
    a.src = url;
  });

function AdminModal({ tracks, close }: { tracks: Track[]; close: () => void }) {
  const [session, setSession] = useState<Session | null>(null),
    [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) return setIsAdmin(null);
    supabase
      .rpc("has_role", { _user_id: session.user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);
  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="modal admin">
        <button className="close" onClick={close}>
          <X />
        </button>
        <div className="eyebrow">
          <i /> إدارة المكتبة
        </div>
        {!session ? (
          <AdminLogin />
        ) : isAdmin === null ? (
          <p className="intro">جارٍ التحقق...</p>
        ) : !isAdmin ? (
          <>
            <h2>لا تملك صلاحية الإدارة</h2>
            <p className="intro">هذا الحساب ليس حساب مالك الاستوديو.</p>
            <button className="gold-btn submit" onClick={() => supabase.auth.signOut()}>
              <LogOut /> تسجيل الخروج
            </button>
          </>
        ) : (
          <AdminPanel tracks={tracks} email={session.user.email ?? ""} />
        )}
      </div>
    </div>
  );
}

function AdminLogin() {
  const [mode, setMode] = useState<"in" | "up">("in"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("البريد أو كلمة المرور غير صحيحة.");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setMsg(
        error ? error.message : "تم إنشاء الحساب. افتح رسالة التأكيد في بريدك ثم سجّل الدخول.",
      );
    }
    setBusy(false);
  };
  return (
    <>
      <h2>{mode === "in" ? "دخول المالك" : "إنشاء حساب المالك"}</h2>
      <p className="intro">
        {mode === "in"
          ? "سجّل الدخول لإدارة الأعمال ورفع الملفات الصوتية."
          : "أول حساب يُنشأ يصبح حساب مالك الاستوديو."}
      </p>
      <div className="form">
        <label className="wide">
          البريد الإلكتروني
          <input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="wide">
          كلمة المرور
          <input
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>
      <button
        className="gold-btn submit"
        disabled={busy || !email || password.length < 6}
        onClick={submit}
      >
        {mode === "in" ? "دخول" : "إنشاء الحساب"}
      </button>
      {msg && <small className="note">{msg}</small>}
      <button className="link-btn" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "لا يوجد حساب بعد؟ أنشئ حساب المالك" : "لديك حساب؟ سجّل الدخول"}
      </button>
    </>
  );
}

async function uploadAudio(trackId: string, file: File) {
  const ext = (file.name.split(".").pop() || "mp3").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${trackId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("track-audio")
    .upload(path, file, { contentType: file.type || "audio/mpeg" });
  if (error) throw error;
  const duration = await readDuration(file);
  const { error: e2 } = await supabase
    .from("tracks")
    .update({ audio_path: path, duration })
    .eq("id", trackId);
  if (e2) throw e2;
}

const STATUS: Record<string, string> = {
  new: "جديد",
  in_progress: "قيد التنفيذ",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
const orderCodeOf = (details: string) =>
  details.match(/رقم الطلب:\s*(LAYL-[A-Z0-9-]+)/)?.[1] ?? "—";
const exportCsv = (rows: OrderRow[]) => {
  const q = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const head = [
    "رقم الطلب",
    "التاريخ",
    "الاسم",
    "الجوال",
    "النوع",
    "النسخة",
    "الإضافات",
    "المرجع",
    "تاريخ المناسبة",
    "التفاصيل",
    "الحالة",
  ];
  const body = rows.map((o) =>
    [
      orderCodeOf(o.details),
      o.created_at.slice(0, 10),
      o.name,
      o.phone,
      o.work_type,
      o.version,
      o.addons.join("، "),
      o.reference,
      o.event_date ?? "",
      o.details,
      STATUS[o.status] ?? o.status,
    ]
      .map(q)
      .join(","),
  );
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + [head.map(q).join(","), ...body].join("\n")], {
      type: "text/csv;charset=utf-8",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "orders.csv";
  a.click();
  URL.revokeObjectURL(url);
};
const useReviews = () =>
  useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
function Reviews() {
  const { data = [] } = useReviews();
  if (!data.length) return null;
  return (
    <section className="section" id="reviews">
      <div className="section-head">
        <div>
          <div className="eyebrow">
            <i /> آراء العملاء
          </div>
          <h2>
            كلمات من <em>عملائنا</em>
          </h2>
        </div>
      </div>
      <div className="cards">
        {data.map((r) => (
          <blockquote className="review" key={r.id}>
            <p>“{r.body}”</p>
            <footer>
              {r.name}
              {r.city && ` — ${r.city}`}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
function ReviewsAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useReviews();
  const [name, setName] = useState(""),
    [city, setCity] = useState(""),
    [body, setBody] = useState("");
  const refresh = () => void qc.invalidateQueries({ queryKey: ["testimonials"] });
  return (
    <>
      <h2 style={{ marginTop: 32 }}>آراء العملاء ({data.length})</h2>
      <div className="form">
        <label>
          الاسم
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          المدينة
          <input value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <label className="wide">
          نص الرأي (من عميل حقيقي فقط)
          <textarea value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
      </div>
      <button
        className="gold-btn submit"
        disabled={!name.trim() || !body.trim()}
        onClick={async () => {
          await supabase
            .from("testimonials")
            .insert({ name: name.trim(), city: city.trim(), body: body.trim() });
          setName("");
          setCity("");
          setBody("");
          refresh();
        }}
      >
        <Plus /> إضافة الرأي
      </button>
      <div className="admin-list">
        {data.map((r) => (
          <div key={r.id}>
            <span>
              {r.name}
              <small>{r.body}</small>
            </span>
            <button
              aria-label="حذف الرأي"
              onClick={async () => {
                await supabase.from("testimonials").delete().eq("id", r.id);
                refresh();
              }}
            >
              <Trash2 />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
function AdminStats({ tracks }: { tracks: Track[] }) {
  const total = tracks.reduce((a, t) => a + t.plays, 0);
  const top = [...tracks].sort((a, b) => b.plays - a.plays)[0];
  return (
    <p className="intro" style={{ marginTop: 24 }}>
      {tracks.length} عمل · {total} تشغيل
      {top && top.plays > 0 ? ` · الأكثر تشغيلاً: ${top.title} (${top.plays})` : ""}
    </p>
  );
}
function OrdersBoard() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => void qc.invalidateQueries({ queryKey: ["orders"] });
  return (
    <>
      <h2 style={{ marginTop: 32 }}>الطلبات الواردة ({orders.length})</h2>
      <button className="link-btn" onClick={() => exportCsv(orders)}>
        <Download size={13} /> تصدير CSV
      </button>
      <div className="admin-list">
        {orders.map((o) => (
          <div key={o.id}>
            <span>
              {o.name} — {o.work_type}
              <small>
                رقم الطلب: <bdi dir="ltr">{orderCodeOf(o.details)}</bdi>
              </small>
              <small>
                {[o.version, o.reference, o.addons.join("، "), o.event_date]
                  .filter(Boolean)
                  .join(" · ")}
              </small>
              {o.details && <small>{o.details}</small>}
              {o.phone && (
                <small>
                  <a
                    href={`https://wa.me/${waNum(o.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    رد عبر واتساب: <bdi dir="ltr">{o.phone}</bdi>
                  </a>
                </small>
              )}
            </span>
            <span className="admin-actions">
              <select
                value={o.status}
                aria-label="حالة الطلب"
                onChange={async (e) => {
                  await supabase.from("orders").update({ status: e.target.value }).eq("id", o.id);
                  refresh();
                }}
              >
                {Object.entries(STATUS).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
              <button
                aria-label="حذف الطلب"
                onClick={async () => {
                  await supabase.from("orders").delete().eq("id", o.id);
                  refresh();
                }}
              >
                <Trash2 />
              </button>
            </span>
          </div>
        ))}
        {!orders.length && <small>لا توجد طلبات بعد.</small>}
      </div>
    </>
  );
}

function AdminPanel({ tracks, email }: { tracks: Track[]; email: string }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(""),
    [category, setCategory] = useState("زفات"),
    [description, setDescription] = useState(""),
    [artist, setArtist] = useState("استوديو ليل الأمسيات"),
    [yt, setYt] = useState(""),
    [lyrics, setLyrics] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState<string | null>(null),
    [msg, setMsg] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["tracks"] });
  const run = async (key: string, fn: () => Promise<void>, ok: string) => {
    setBusy(key);
    setMsg("");
    try {
      await fn();
      await refresh();
      setMsg(ok);
    } catch {
      setMsg("حدث خطأ، حاول مرة أخرى.");
    } finally {
      setBusy(null);
    }
  };
  const add = () =>
    run(
      "add",
      async () => {
        const { data, error } = await supabase
          .from("tracks")
          .insert({
            title: title.trim(),
            category,
            description: description.trim(),
            artist: artist.trim() || "استوديو ليل الأمسيات",
            youtube_url: yt.trim() || null,
            lyrics: lyrics.trim(),
          })
          .select("id")
          .single();
        if (error) throw error;
        if (file) await uploadAudio(data.id, file);
        setTitle("");
        setDescription("");
        setFile(null);
      },
      "تمت إضافة العمل.",
    );
  return (
    <>
      <h2>إضافة عمل جديد</h2>
      <p className="intro">
        مسجّل باسم {email} ·{" "}
        <button className="link-btn inline" onClick={() => supabase.auth.signOut()}>
          تسجيل الخروج
        </button>
      </p>
      <div className="form">
        <label style={{ order: 5 }}>
          الفنان / المؤدي
          <input value={artist} onChange={(e) => setArtist(e.target.value)} />
        </label>
        <label style={{ order: 5 }}>
          رابط يوتيوب
          <input
            dir="ltr"
            value={yt}
            onChange={(e) => setYt(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </label>
        <label className="wide" style={{ order: 6 }}>
          كلمات العمل (اختياري)
          <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} />
        </label>
        <label className="wide">
          عنوان العمل
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="اسم العمل" />
        </label>
        <label>
          التصنيف
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>زفات</option>
            <option>شيلات</option>
            <option>مخصص</option>
          </select>
        </label>
        <label>
          الملف الصوتي
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="wide">
          وصف العمل
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف قصير"
          />
        </label>
      </div>
      <button className="gold-btn submit" disabled={!title.trim() || !!busy} onClick={add}>
        <Plus /> {busy === "add" ? "جارٍ الحفظ..." : "إضافة العمل"}
      </button>
      {msg && <small className="note">{msg}</small>}
      <div className="admin-list">
        {tracks.map((t) => (
          <div key={t.id}>
            <span>
              {t.title}
              <small>
                {t.category} · {t.audioUrl ? "الصوت مرفوع" : "بلا صوت"}
              </small>
            </span>
            <span className="admin-actions">
              <label className="upload-btn" aria-label="رفع ملف صوتي">
                {busy === t.id ? "..." : <Upload />}
                <input
                  type="file"
                  accept="audio/*"
                  hidden
                  disabled={!!busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void run(t.id, () => uploadAudio(t.id, f), `تم رفع صوت «${t.title}».`);
                  }}
                />
              </label>
              <button
                disabled={!!busy}
                onClick={() =>
                  run(
                    "del" + t.id,
                    async () => {
                      const { error } = await supabase.from("tracks").delete().eq("id", t.id);
                      if (error) throw error;
                    },
                    "تم حذف العمل.",
                  )
                }
                aria-label="حذف"
              >
                <Trash2 />
              </button>
            </span>
          </div>
        ))}
      </div>
      <AdminStats tracks={tracks} />
      <ReviewsAdmin />
      <OrdersBoard />
    </>
  );
}
