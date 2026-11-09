/* Preview-only in-memory stand-in for Supabase (the real one needs a hosted project). */
const S = "استوديو ليل الأمسيات", CH = "https://www.youtube.com/@studio-layl", yt = (i: string) => "https://www.youtube.com/watch?v=" + i;
const tk = (n: number, title: string, category: string, description: string, artist: string, versions: string[], y: string, extra = {}) => ({ id: "t" + n, title, category, description, artist, versions, youtube_url: y, duration: "معاينة", featured: n === 1, audio_path: null, sort_order: n, lyrics: "", plays: 0, created_at: "2026-01-01", ...extra });
export const db: any = {
  tracks: [
    tk(1, "ليلة عمر — زفة سمو الشيخة نوف", "زفات", "زفة كوشة وملكة", S, ["fx", "daf", "full"], yt("N2nvGNIbjGg"), { lyrics: "يا ليلة العمر\nيا فرحة القلب" }),
    tk(2, "يا مرحبا ترحيبة العز والشان", "شيلات", "شيلة ترحيبية وعرضة سعودية", S, ["fx", "daf", "full"], CH),
    tk(3, "أصدح يا صوت الفخر والمهابة", "شيلات", "شيلة زواج ومدح قبائل", S, ["daf", "full", "pure"], CH),
    tk(4, "طلت سمو — مقدمة استعدادية 2027", "زفات", "زفة طلة عروس", S, ["fx", "full"], yt("gU_frH_T6y8")),
    tk(5, "أقبلت", "زفات", "زفة طلة عروس", "زينة عماد وعبدالمجيد عبدالله", ["fx", "daf", "full"], yt("IKYvQuSgnIw")),
    tk(6, "في حضورك", "زفات", "زفة كوشة وملكة", "محمد عبده", ["fx", "full"], yt("t1KEn96hig4")),
    tk(7, "جمال ما يوصف", "زفات", "زفة مسار عروس", "راشد الماجد", ["fx", "daf", "full"], yt("KVU5Ds0f4bw")),
    tk(8, "تحرسك الأذكار", "زفات", "دخلة عروس", S, ["fx", "pure"], yt("uUtuWuHKd1I")),
    tk(9, "عن جمالك", "زفات", "زفة كوشة وملكة", S, ["fx", "daf", "full"], CH),
    tk(10, "عقد المحبة", "زفات", "زفة كوشة وملكة", S, ["fx", "full"], CH),
    tk(11, "لبيه", "زفات", "زفة عروس", S, ["daf", "full"], CH),
  ],
  orders: [] as any[],
  testimonials: [] as any[],
};
(window as any).__db = db;
const defs: any = {
  orders: { status: "new", phone: "", version: "", addons: [], reference: "", occasion: "", details: "", event_date: null },
  tracks: { category: "زفات", duration: "—", description: "", audio_path: null, featured: false, sort_order: 0, artist: S, versions: ["fx"], youtube_url: null, lyrics: "", plays: 0 },
  testimonials: { city: "" },
};
let n = 100;
class Q {
  op = "select"; row: any; f: [string, any][] = []; one = false; ord: any;
  constructor(public t: string) {}
  select() { return this; }
  insert(r: any) { this.op = "insert"; this.row = r; return this; }
  update(r: any) { this.op = "update"; this.row = r; return this; }
  delete() { this.op = "delete"; return this; }
  eq(k: string, v: any) { this.f.push([k, v]); return this; }
  order(c: string, o?: any) { this.ord = [c, o?.ascending !== false]; return this; }
  single() { this.one = true; return this; }
  then(res: any, rej: any) { return Promise.resolve(this.run()).then(res, rej); }
  run() {
    const rows = db[this.t], m = (r: any) => this.f.every(([k, v]) => r[k] === v);
    if (this.op === "insert") { const r = { id: "id" + ++n, created_at: new Date().toISOString(), ...defs[this.t], ...this.row }; rows.unshift(r); return { data: this.one ? r : [r], error: null }; }
    if (this.op === "update") { rows.filter(m).forEach((r: any) => Object.assign(r, this.row)); return { data: null, error: null }; }
    if (this.op === "delete") { db[this.t] = rows.filter((r: any) => !m(r)); return { data: null, error: null }; }
    const d = rows.filter(m).slice();
    if (this.ord) { const [c, asc] = this.ord; d.sort((a: any, b: any) => (a[c] < b[c] ? -1 : 1) * (asc ? 1 : -1)); }
    return { data: this.one ? d[0] : d, error: null };
  }
}
let session: any = null; const subs: any[] = [];
const setS = (s: any) => { session = s; subs.forEach((f) => f("x", s)); };
export const supabase = {
  from: (t: string) => new Q(t),
  rpc: async (fn: string, a: any) => {
    if (fn === "increment_plays") { const r = db.tracks.find((x: any) => x.id === a.track_id); if (r) r.plays++; }
    return { data: fn === "has_role" ? true : null, error: null };
  },
  auth: {
    getSession: async () => ({ data: { session } }),
    onAuthStateChange: (cb: any) => { subs.push(cb); return { data: { subscription: { unsubscribe() {} } } }; },
    signInWithPassword: async ({ email }: any) => { setS({ user: { id: "u1", email } }); return { data: { session }, error: null }; },
    signUp: async ({ email }: any) => { setS({ user: { id: "u1", email } }); return { data: { session }, error: null }; },
    signOut: async () => { setS(null); return { error: null }; },
  },
  storage: { from: () => ({ upload: async () => ({ error: null }) }) },
};
