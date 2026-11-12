import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function requireAdmin() {
  const { getAdminSession } = await import("./admin-auth.server");
  const session = await getAdminSession();
  if (!session || session.role !== "admin") throw new Error("Admin access required");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const trackInput = z.object({
  title: z.string().trim().min(1).max(160),
  category: z.enum(["زفات", "شيلات", "مخصص"]),
  description: z.string().trim().max(500),
  artist: z.string().trim().max(120),
  youtubeUrl: z.string().trim().max(500),
  lyrics: z.string().trim().max(5000),
});

export const adminAddTrack = createServerFn({ method: "POST" })
  .inputValidator(trackInput)
  .handler(async ({ data }) => {
    const db = await requireAdmin();
    const { data: track, error } = await db
      .from("tracks")
      .insert({
        title: data.title,
        category: data.category,
        description: data.description,
        artist: data.artist || "استوديو ليل الأمسيات",
        youtube_url: data.youtubeUrl || null,
        lyrics: data.lyrics,
      })
      .select("id")
      .single();
    if (error) throw new Error("تعذر إضافة العمل");
    return track;
  });

export const adminDeleteTrack = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const db = await requireAdmin();
    const { error } = await db.from("tracks").delete().eq("id", data.id);
    if (error) throw new Error("تعذر حذف العمل");
    return { ok: true };
  });

export const adminAddReview = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().trim().min(1).max(80),
      city: z.string().trim().max(80),
      body: z.string().trim().min(1).max(600),
    }),
  )
  .handler(async ({ data }) => {
    const db = await requireAdmin();
    const { error } = await db.from("testimonials").insert(data);
    if (error) throw new Error("تعذر إضافة الرأي");
    return { ok: true };
  });

export const adminDeleteReview = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const db = await requireAdmin();
    const { error } = await db.from("testimonials").delete().eq("id", data.id);
    if (error) throw new Error("تعذر حذف الرأي");
    return { ok: true };
  });

export const adminListOrders = createServerFn({ method: "GET" }).handler(async () => {
  const db = await requireAdmin();
  const { data, error } = await db
    .from("orders")
    .select(
      "id,created_at,details,event_date,name,occasion,work_type,version,addons,reference,status,phone",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error("تعذر تحميل الطلبات");
  return data ?? [];
});

export const adminUpdateOrder = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid(), status: z.string().min(1).max(40) }))
  .handler(async ({ data }) => {
    const db = await requireAdmin();
    const { error } = await db.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error("تعذر تحديث الطلب");
    return { ok: true };
  });

export const adminDeleteOrder = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const db = await requireAdmin();
    const { error } = await db.from("orders").delete().eq("id", data.id);
    if (error) throw new Error("تعذر حذف الطلب");
    return { ok: true };
  });
