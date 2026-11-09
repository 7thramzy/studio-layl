# Archive to App

/skill:migrate-external-project Source: code archive. Migrate the attached project into Lovable.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/86e89815-91c8-481e-92c7-046f78096b57).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## التطويرات المدمجة (v2)
- أعمال الاستوديو الحقيقية (migration `0003_real_works.sql`) مع أعمدة `artist` و`versions` و`youtube_url`.
- مشغل سفلي عائم مع مبدّل النسخ (معاينة Web Audio مُركّبة إلى أن يُرفع ملف حقيقي من لوحة الإدارة).
- فلتر النسخ، شارات النسخ، زر يوتيوب، قسم التواصل بزر نسخ، إضافات الطلب، رقم واتساب `966505174857`.
- **أمان:** أول حساب يُسجَّل يصبح مديراً تلقائياً؛ سجّل حسابك فور النشر قبل أي زائر.

## v3: الهوية والطلبات
- الشعار الرسمي في الهيدر والفوتر والواجهة الرئيسية والأيقونة، وبانر الاستوديو خلفية خفيفة للواجهة (الداكنة فقط).
- زجاجية (Glassmorphism) للهيدر والبطاقات والمشغل، ومؤشر تركيز للوحة المفاتيح، واحترام `prefers-reduced-motion`.
- الطلبات تُحفظ في قاعدة البيانات (migration `0004_order_capture.sql`) وتظهر في لوحة الإدارة بحالات (جديد / قيد التنفيذ / تم التسليم / ملغي).

## v4: النمو وإدارة الطلبات
- شريط تقدم قابل للسحب، نافذة كلمات، مشاركة رابط عمل (`?work=`)، عدّاد تشغيل، آراء عملاء (يضيفها المدير فقط)، رقم جوال في الطلب مع «رد عبر واتساب»، تصدير CSV.
- Migration: `0005_growth.sql`. إشعار بريدي اختياري: `supabase/functions/notify-order` (يتطلب Database Webhook ومفتاح Resend).

- اختبار شامل في متصفح حقيقي على نسخة معاينة (بيانات في الذاكرة): `npx vite build -c vite.preview.config.ts && python3 preview/assemble.py && python3 preview/e2e.py` (يتطلب Playwright).
