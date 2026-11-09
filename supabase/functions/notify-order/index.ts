// Optional: create a Database Webhook (INSERT on public.orders) that calls this function,
// then set the secrets RESEND_API_KEY and NOTIFY_EMAIL. Without them it does nothing.
Deno.serve(async (req: Request) => {
  const { record: o } = await req.json();
  const key = Deno.env.get("RESEND_API_KEY"),
    to = Deno.env.get("NOTIFY_EMAIL");
  if (!key || !to) return new Response("not configured");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Studio Layl <onboarding@resend.dev>",
      to,
      subject: `طلب جديد: ${o.name} — ${o.work_type}`,
      text: [
        `الاسم: ${o.name}`,
        `الجوال: ${o.phone || "-"}`,
        `النوع: ${o.work_type}`,
        `النسخة: ${o.version}`,
        `المرجع: ${o.reference || "-"}`,
        `التفاصيل: ${o.details || "-"}`,
      ].join("\n"),
    }),
  });
  return new Response(res.ok ? "ok" : "failed", { status: res.ok ? 200 : 502 });
});
