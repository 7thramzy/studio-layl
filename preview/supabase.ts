/* Preview-only in-memory stand-in for Supabase (the real one needs a hosted project). */
type JsonRecord = Record<string, unknown>;
type Filter = [key: string, value: unknown];
type QueryResult = { data: unknown; error: null };
type Session = { user: { id: string; email: string } } | null;

type Track = {
  id: string;
  title: string;
  category: string;
  description: string;
  artist: string;
  versions: string[];
  youtube_url: string | null;
  duration: string;
  featured: boolean;
  audio_path: string | null;
  sort_order: number;
  lyrics: string;
  plays: number;
  created_at: string;
  [key: string]: unknown;
};

type Order = JsonRecord & {
  id?: string;
  created_at?: string;
  status?: string;
  phone?: string;
  version?: string;
  addons?: string[];
  reference?: string;
  occasion?: string;
  details?: string;
  event_date?: string | null;
};

type Testimonial = JsonRecord & { city?: string };
type Database = { tracks: Track[]; orders: Order[]; testimonials: Testimonial[] };

const S = "استوديو ليل الأمسيات",
  CH = "https://www.youtube.com/@studio-layl",
  yt = (i: string) => "https://www.youtube.com/watch?v=" + i;

const tk = (
  n: number,
  title: string,
  category: string,
  description: string,
  artist: string,
  versions: string[],
  y: string,
  extra: JsonRecord = {},
): Track => ({
  id: "t" + n,
  title,
  category,
  description,
  artist,
  versions,
  youtube_url: y,
  duration: "معاينة",
  featured: n === 1,
  audio_path: null,
  sort_order: n,
  lyrics: "",
  plays: 0,
  created_at: "2026-01-01",
  ...extra,
});

export const db: Database = {
  tracks: [
    tk(
      1,
      "ليلة عمر — زفة سمو الشيخة نوف",
      "زفات",
      "زفة كوشة وملكة",
      S,
      ["fx", "daf", "full"],
      yt("N2nvGNIbjGg"),
      { lyrics: "يا ليلة العمر\nيا فرحة القلب" },
    ),
    tk(
      2,
      "يا مرحبا ترحيبة العز والشان",
      "شيلات",
      "شيلة ترحيبية وعرضة سعودية",
      S,
      ["fx", "daf", "full"],
      CH,
    ),
    tk(
      3,
      "أصدح يا صوت الفخر والمهابة",
      "شيلات",
      "شيلة زواج ومدح قبائل",
      S,
      ["daf", "full", "pure"],
      CH,
    ),
    tk(
      4,
      "طلت سمو — مقدمة استعدادية 2027",
      "زفات",
      "زفة طلة عروس",
      S,
      ["fx", "full"],
      yt("gU_frH_T6y8"),
    ),
    tk(
      5,
      "أقبلت",
      "زفات",
      "زفة طلة عروس",
      "زينة عماد وعبدالمجيد عبدالله",
      ["fx", "daf", "full"],
      yt("IKYvQuSgnIw"),
    ),
    tk(6, "في حضورك", "زفات", "زفة كوشة وملكة", "محمد عبده", ["fx", "full"], yt("t1KEn96hig4")),
    tk(
      7,
      "جمال ما يوصف",
      "زفات",
      "زفة مسار عروس",
      "راشد الماجد",
      ["fx", "daf", "full"],
      yt("KVU5Ds0f4bw"),
    ),
    tk(8, "تحرسك الأذكار", "زفات", "دخلة عروس", S, ["fx", "pure"], yt("uUtuWuHKd1I")),
    tk(9, "عن جمالك", "زفات", "زفة كوشة وملكة", S, ["fx", "daf", "full"], CH),
    tk(10, "عقد المحبة", "زفات", "زفة كوشة وملكة", S, ["fx", "full"], CH),
    tk(11, "لبيه", "زفات", "زفة عروس", S, ["daf", "full"], CH),
  ],
  orders: [],
  testimonials: [],
};

(window as Window & { __db?: Database }).__db = db;

const defs: Record<string, JsonRecord> = {
  orders: {
    status: "new",
    phone: "",
    version: "",
    addons: [],
    reference: "",
    occasion: "",
    details: "",
    event_date: null,
  },
  tracks: {
    category: "زفات",
    duration: "—",
    description: "",
    audio_path: null,
    featured: false,
    sort_order: 0,
    artist: S,
    versions: ["fx"],
    youtube_url: null,
    lyrics: "",
    plays: 0,
  },
  testimonials: { city: "" },
};

let n = 100;

class Q implements PromiseLike<QueryResult> {
  private op = "select";
  private row: JsonRecord = {};
  private f: Filter[] = [];
  private one = false;
  private ord: [column: string, ascending: boolean] | null = null;

  constructor(private readonly t: keyof Database) {}

  select() {
    return this;
  }

  insert(r: JsonRecord) {
    this.op = "insert";
    this.row = r;
    return this;
  }

  update(r: JsonRecord) {
    this.op = "update";
    this.row = r;
    return this;
  }

  delete() {
    this.op = "delete";
    return this;
  }

  eq(k: string, v: unknown) {
    this.f.push([k, v]);
    return this;
  }

  order(c: string, o?: { ascending?: boolean }) {
    this.ord = [c, o?.ascending !== false];
    return this;
  }

  single() {
    this.one = true;
    return this;
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.run()).then(onfulfilled, onrejected);
  }

  private run(): QueryResult {
    const rows = db[this.t] as JsonRecord[];
    const matches = (r: JsonRecord) => this.f.every(([k, v]) => r[k] === v);

    if (this.op === "insert") {
      const r: JsonRecord = {
        id: "id" + ++n,
        created_at: new Date().toISOString(),
        ...defs[this.t],
        ...this.row,
      };
      rows.unshift(r);
      return { data: this.one ? r : [r], error: null };
    }

    if (this.op === "update") {
      rows.filter(matches).forEach((r) => Object.assign(r, this.row));
      return { data: null, error: null };
    }

    if (this.op === "delete") {
      db[this.t] = rows.filter((r) => !matches(r)) as Database[typeof this.t];
      return { data: null, error: null };
    }

    const data = rows.filter(matches).slice();
    if (this.ord) {
      const [column, ascending] = this.ord;
      data.sort((a, b) => {
        const left = String(a[column] ?? "");
        const right = String(b[column] ?? "");
        return (left < right ? -1 : left > right ? 1 : 0) * (ascending ? 1 : -1);
      });
    }
    return { data: this.one ? data[0] : data, error: null };
  }
}

let session: Session = null;
const subs: Array<(event: string, value: Session) => void> = [];
const setS = (s: Session) => {
  session = s;
  subs.forEach((f) => f("x", s));
};

export const supabase = {
  from: (t: keyof Database) => new Q(t),
  rpc: async (fn: string, a: JsonRecord) => {
    if (fn === "increment_plays") {
      const r = db.tracks.find((x) => x.id === a.track_id);
      if (r) r.plays++;
    }
    return { data: fn === "has_role" ? true : null, error: null };
  },
  auth: {
    getSession: async () => ({ data: { session } }),
    onAuthStateChange: (cb: (event: string, value: Session) => void) => {
      subs.push(cb);
      return { data: { subscription: { unsubscribe() {} } } };
    },
    signInWithPassword: async ({ email }: { email: string }) => {
      setS({ user: { id: "u1", email } });
      return { data: { session }, error: null };
    },
    signUp: async ({ email }: { email: string }) => {
      setS({ user: { id: "u1", email } });
      return { data: { session }, error: null };
    },
    signOut: async () => {
      setS(null);
      return { error: null };
    },
  },
  storage: { from: () => ({ upload: async () => ({ error: null }) }) },
};
