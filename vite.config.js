import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { siteToday, readMeta, isLive, listPosts } from './scripts/lib/blog-schedule.mjs'

/* ── جدولة المقالات ──
   اليوم بتوقيت دمشق وقت البناء (أو SITE_TODAY). المقال الذي لم يحن موعده أو
   المسودة يُستبدل ملفه بمدخل فارغ (slug وstatus وdate وtitle وأقسام فارغة):
   فلا يظهر نصه في حزمة JS التي يقرؤها الزائر، ولا يدخل الصفحات. والمقالات
   الظاهرة تُعرَّف slugاتها في __LIVE_POSTS__ لما يحتاج أن يعرف (روابط الأدوات).
   القاعدة في scripts/lib/blog-schedule.mjs. */
const TODAY = siteToday()
const LIVE_POSTS = listPosts().filter(p => isLive(p, TODAY)).map(p => p.slug)

function blogSchedule() {
  return {
    name: 'ihkaam-blog-schedule',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0].replaceAll('\\', '/')
      if (!/\/src\/data\/blog\/[^/]+\.js$/.test(file)) return null
      const meta = readMeta(code, file)
      if (isLive(meta, TODAY)) return null
      return { code: `export default ${JSON.stringify({ ...meta, sections: [] })}`, map: null }
    },
  }
}

/* المكتبات في حزمٍ مستقلة عن كود الموقع.
 *
 * المكتبات لا تتغيّر بين النشرات، فتُفصل لتبقى في ذاكرة المتصفح عبرها،
 * وتُنزَّل متوازيةً بدل ملفٍّ واحد ضخم.
 *
 * والأهم (ISS-27): ما يُحمَّل مع أول صفحة هو v-react و v-router و v-icons
 * وكود الموقع فقط. v-motion (framer-motion) تطلبها الأقسام الكسولة تحت
 * الهيرو وصفحات أخرى، و v-supabase لا تُطلب إلا عند كتابةٍ أو تسجيل دخول
 * (src/config/supabaseClient.js). فلا مكان لهما في المسار الحرج.
 *
 * priority تحسم لمن تذهب الوحدة المشتركة: كل مجموعة تضمّ معها ما تعتمد
 * عليه، و framer-motion تعتمد على react/jsx-runtime. بلا أولوية أعلى لـ
 * v-react كانت jsx-runtime تُسحب إلى v-motion، فتجرّ الحزمةُ الأولى
 * مكتبةَ الحركة كلّها لأجل دالةٍ واحدة.
 */
const VENDOR_GROUPS = [
  { name: 'v-react',    test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 60 },
  { name: 'v-router',   test: /[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run|cookie|set-cookie-parser)[\\/]/, priority: 50 },
  { name: 'v-icons',    test: /[\\/]node_modules[\\/]lucide-react[\\/]/, priority: 40 },
  { name: 'v-supabase', test: /[\\/]node_modules[\\/]@supabase[\\/]/, priority: 30 },
  { name: 'v-motion',   test: /[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/, priority: 20 },
  { name: 'v-misc',     test: /[\\/]node_modules[\\/]/, priority: 0 },
]

export default defineConfig({
  define: {
    __SITE_TODAY__: JSON.stringify(TODAY),
    __LIVE_POSTS__: JSON.stringify(LIVE_POSTS),
  },
  plugins: [
    blogSchedule(),
    react(),
    tailwindcss(),
  ],
  build: {
    // الحزم مفصولة وأكبرها دون 300KB خام، فتحذير الـ500KB لم يعد يعني شيئاً
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: { codeSplitting: { groups: VENDOR_GROUPS } },
    },
  },
})
