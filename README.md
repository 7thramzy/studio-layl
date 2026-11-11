# Studio Layl

منصة عربية لإنتاج وإدارة الأعمال الصوتية والزفات والشيلات، مبنية على React وTanStack Start وSupabase، ومهيأة للنشر على Vercel عبر Nitro.

## التشغيل المحلي

```bash
npm ci
npm run dev
```

## البناء والنشر

```bash
NITRO_PRESET=vercel npm run build
```

يُحفظ مفتاح Supabase للخدمة على الخادم فقط. يحتاج التطبيق إلى `SUPABASE_URL` و`SUPABASE_PUBLISHABLE_KEY` و`SUPABASE_SERVICE_ROLE_KEY`، إضافة إلى نسختي المتصفح `VITE_SUPABASE_URL` و`VITE_SUPABASE_PUBLISHABLE_KEY`.

## قاعدة البيانات

طبّق ملفات `drizzle/migrations/` بالترتيب من `0000` إلى `0005`. استخدم Bucket خاصًا باسم `track-audio` للملفات الصوتية، وأنشئ حساب المدير الأول بعد النشر.

## تجربة المستخدم

تُحفظ الطلبات أولًا في قاعدة البيانات ثم يُفتح WhatsApp برسالة جاهزة تتضمن رقم الطلب. لا تحتوي المنصة على أسعار أو سلة أو دفع إلكتروني؛ استكمال التفاصيل يتم عبر WhatsApp.

## الاختبارات

```bash
npm run lint
npm test -- --run
npm run build
```
