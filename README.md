# إحكام — الموقع الرسمي (ihkaam.app)

واجهة React + Vite + Tailwind v4، وقاعدة بيانات Supabase. النشر على Netlify.

## التشغيل

```sh
npm install
cp .env.example .env     # ثم ضع قيم VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY
npm run dev              # تطوير
npm run build            # بناء إلى dist/
npm run lint
```

## بنية المجلد

| المسار | المحتوى |
|---|---|
| `src/pages/` | صفحات المسارات (التوجيه في `src/App.jsx`) |
| `src/components/layout/` | الهيكل: Layout، Navbar، Footer، الميتا، حارس المسارات |
| `src/components/sections/` | أقسام الصفحات العامة (Hero، Pain، About، Contact…) |
| `src/components/ihkaam/` | أقسام صفحة إحكام والاشتراك |
| `src/components/forms/` | النماذج (طلب العرض، تقييم العميل) |
| `src/components/unused/` | مكوّنان غير معروضين، محفوظان لقيمة محتواهما (الميزات التفصيلية، نقطة الجودة) |
| `src/config/` | Supabase، SEO، الألوان، أرقام الصفحة الرئيسية |
| `src/data/` | محتوى المدوّنة والمساعدة والمزايا |
| `src/hooks/` | خطّافات React |
| `src/index.css` | **مصدر الحقيقة للهوية**: الألوان والخطوط والفئات |
| `public/` | ملفات تُخدَم كما هي: أيقونات، `og-cover`، `sitemap.xml`، `_headers`، `_redirects` |
| `scripts/` | أدوات صيانة بـ Node (ضغط الصور، توليد الأيقونة) |
| `supabase/migrations/` | الترحيلات الأمامية فقط، مرتّبة بالتاريخ |
| `supabase/rollbacks/` | تراجع كل ترحيل حسّاس، بالاسم نفسه |
| `supabase/diagnostics/` | استعلامات قراءة فقط: تشخيص ولقطات قبل/بعد |
| `supabase/seeds/` | زراعة بيانات العرض وتراجعها |
| `supabase/legacy/` | سكربتات مُنفَّذة سابقاً، للرجوع فقط، لا تُشغَّل |
| `supabase/functions/` | Edge Functions |
| `marketing/` | مواد التسويق: `carousels/` (HTML وصور) و`copy/` (نصوص المنشورات) |
| `docs/` | بريف الهوية لـ Claude Design |
| `.design-sync/` | إعداد مزامنة نظام التصميم (انظر `NOTES.md` داخله) |

مجلدات مولَّدة وغير متتبَّعة في git: `dist/`، `ds-bundle/`، `.ds-sync/`.

## قواعد

- ملفات `supabase/migrations/` تُطبَّق يدوياً في SQL Editor؛ لا تضع فيها تراجعاً أو تشخيصاً.
- لا مفاتيح سرّية في الريبو. `.env` خارج git، و`.mcp.json` يقرأ التوكن من متغيّر بيئة.
