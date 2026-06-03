# منصة السكن المشترك في الشارقة

نسخة MVP متخصصة فقط في الغرف والبارتشنات والأسرة في الشارقة، مبنية بـ Next.js و Supabase.

## المزايا الموجودة

- تسجيل دخول عبر Supabase Auth.
- صلاحيات: Admin و Staff و Owner و Broker.
- إدارة الملاك من المدير.
- إضافة الوحدات ورفع الصور والفيديوهات إلى Supabase Storage.
- توليد كود الوحدة تلقائياً بصيغة `OwnerCode-Sequence` مثل `1950-01`.
- بحث سريع متعدد الفلاتر: الكود، المنطقة، النوع، الفئة، السعر، الحالة.
- إخفاء بيانات الملاك عن البروكرز.
- طلب تفاصيل أو تواصل من صفحة البحث.
- Audit Log للتغييرات على الملاك والوحدات والمستخدمين.
- تصميم عربي RTL ومتجاوب يبدأ من الهاتف.

## التشغيل المحلي

1. ثبّت Node.js 20 أو أحدث.
2. انسخ `.env.example` إلى `.env.local`.
3. ضع مفاتيح Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. ثبّت الحزم وشغّل المشروع:

```bash
npm install
npm run dev
```

ثم افتح `http://localhost:3000`.

## إعداد Supabase

1. أنشئ مشروع Supabase جديد.
2. افتح SQL Editor وشغّل الملف:

```text
supabase/schema.sql
```

3. أنشئ أول مستخدم Admin من Supabase Auth.
4. انسخ UUID الخاص به، ثم شغّل:

```sql
insert into public.profiles (id, full_name, role)
values ('AUTH_USER_UUID', 'Admin', 'admin');
```

5. من صفحة `/dashboard/users` يمكنك إضافة بقية المستخدمين.

## التخزين

الملف ينشئ bucket باسم `unit-media`. دعم 100GB يعتمد على خطة Supabase المختارة. للمرحلة الأولى استخدم Supabase Pro أو Team حسب حجم الفيديوهات المتوقع، وراقب:

- Storage size
- Egress bandwidth
- Upload file size

عند التوسع يمكن نقل الفيديوهات إلى Cloudflare R2 أو S3 مع إبقاء الروابط داخل PostgreSQL.

## خطة النشر

1. استضافة الواجهة على Vercel.
2. ربط GitHub بالمشروع.
3. إضافة متغيرات البيئة في Vercel.
4. تشغيل `supabase/schema.sql` في Supabase production.
5. إنشاء أول Admin.
6. تفعيل النسخ الاحتياطي في Supabase Dashboard.
7. ضبط نطاق مخصص مثل `sharjahsharedhousing.com`.

## ملاحظات إنتاجية مهمة

- لا تضع `SUPABASE_SERVICE_ROLE_KEY` في المتصفح أبداً؛ هو مستخدم فقط داخل Server Actions.
- فعّل النسخ الاحتياطي اليومي من Supabase.
- راجع `audit_log` دورياً عند وجود تغييرات حساسة.
- قبل الإطلاق التجاري، أضف ضغط فيديو أو معالجة خارجية لتقليل استهلاك التخزين والباندويث.
