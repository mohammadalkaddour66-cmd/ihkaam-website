import { Suspense, lazy } from 'react'
import HeroSection from '../components/sections/HeroSection'

/* ══════════════════════════════════════════════════════════════════
   الرئيسية — الهيرو وحده في الحزمة الأولى (ISS-26/27)

   الأقسام تحت الهيرو كسولة: كلٌّ في حزمته، ومعها مكتبة الحركة
   framer-motion التي لا يحتاجها الهيرو. نصّها كاملٌ في HTML المُصيَّر
   مسبقاً (prerenderToNodeStream ينتظر الحزم الكسولة قبل الكتابة)، فالزائر
   والزاحف يريانها من أول تحميل، ثم يُهيّئ React كل قسمٍ حين تصل حزمته،
   في مهمّةٍ مستقلة لا تحجب الهيرو ولا بعضها بعضاً.

   كل قسم في حدّ Suspense خاص به: هكذا يُبقي React على HTML القسم كما
   هو إلى أن تصل حزمته ثم يهيّئه وحده (selective hydration)، بدل أن
   ينتظر الحزم كلها.
   ══════════════════════════════════════════════════════════════════ */
const IhkaamTrustStats       = lazy(() => import('../components/ihkaam/IhkaamTrustStats'))
const PainSection            = lazy(() => import('../components/sections/PainSection'))
const SolutionPreviewSection = lazy(() => import('../components/sections/SolutionPreviewSection'))
const HowItWorksSection      = lazy(() => import('../components/sections/HowItWorksSection'))
const IhkaamPartners         = lazy(() => import('../components/ihkaam/IhkaamPartners'))
const TestimonialsSection    = lazy(() => import('../components/sections/TestimonialsSection'))
const IhkaamSuccessStories   = lazy(() => import('../components/ihkaam/IhkaamSuccessStories'))
const IhkaamByNumbers        = lazy(() => import('../components/ihkaam/IhkaamByNumbers'))
const FeatureLinksSection    = lazy(() => import('../components/sections/FeatureLinksSection'))
const HomeFAQSection         = lazy(() => import('../components/sections/HomeFAQSection'))
const IhkaamCTABanner        = lazy(() => import('../components/ihkaam/IhkaamCTABanner'))

function Deferred({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>
}

export default function Home() {
  return (
    <>
      {/* ── الفصل الأول: من نحن، ولماذا تثق ── */}
      <HeroSection />
      <Deferred><IhkaamTrustStats /></Deferred>

      {/* ── الفصل الثاني: المشكلة، والجواب، والطريق ── */}
      <Deferred><PainSection /></Deferred>
      <Deferred><SolutionPreviewSection /></Deferred>
      <Deferred><HowItWorksSection /></Deferred>

      {/* ── الفصل الثالث: البرهان — بأصواتٍ ليست صوتنا ── */}
      <Deferred><IhkaamPartners /></Deferred>
      <Deferred><TestimonialsSection /></Deferred>
      <Deferred><IhkaamSuccessStories /></Deferred>
      <Deferred><IhkaamByNumbers /></Deferred>

      <Deferred><FeatureLinksSection extraLinks /></Deferred>

      {/* أسئلة المشتري قبل القرار (ISS-56) */}
      <Deferred><HomeFAQSection /></Deferred>

      {/* ── الفصل الرابع: الدعوة ── */}
      <Deferred><IhkaamCTABanner /></Deferred>
    </>
  )
}
