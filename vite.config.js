import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* المكتبات في حزمٍ مستقلة عن كود الموقع.
 *
 * قبل هذا كان كل شيء في ملفٍ واحد (683KB / 202KB مضغوطاً)، فتعديل سطرِ نصٍّ
 * واحد يُبطل ذاكرة المتصفح للحزمة كلها ويُجبر الزائر العائد على تنزيل رياكت
 * و supabase و framer من جديد. المكتبات لا تتغيّر بين النشرات، فتُفصل لتبقى
 * في الذاكرة عبرها: الآن لا يُبطل التعديل إلا ~32KB من كود الموقع.
 * وكفائدة ثانية: الملفات تُنزَّل متوازيةً بدل ملفٍّ واحد ضخم.
 */
function vendorChunk(id) {
  if (!id.includes('node_modules')) return
  if (/framer-motion|motion-dom|motion-utils/.test(id)) return 'v-motion'
  if (/@supabase/.test(id))                             return 'v-supabase'
  if (/react-router|@remix-run/.test(id))               return 'v-router'
  if (/lucide-react/.test(id))                          return 'v-icons'
  if (/react-dom|[\\/]react[\\/]|scheduler/.test(id))   return 'v-react'
  return 'v-misc'
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // الحزم الآن مفصولة وأكبرها ~194KB خام، فتحذير الـ500KB لم يعد يعني شيئاً
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: { manualChunks: vendorChunk },
    },
  },
})
