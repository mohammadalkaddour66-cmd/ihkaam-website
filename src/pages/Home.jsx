import HeroSection            from '../components/HeroSection'
import IhkaamTrustStats       from '../components/IhkaamTrustStats'
import PainSection             from '../components/PainSection'
import SolutionPreviewSection  from '../components/SolutionPreviewSection'
import HowItWorksSection       from '../components/HowItWorksSection'
import IhkaamPartners          from '../components/IhkaamPartners'
import TestimonialsSection     from '../components/TestimonialsSection'
import IhkaamSuccessStories    from '../components/IhkaamSuccessStories'
import IhkaamByNumbers         from '../components/IhkaamByNumbers'
import IhkaamCTABanner         from '../components/IhkaamCTABanner'

export default function Home() {
  return (
    <>
      {/* ── الفصل الأول: من نحن، ولماذا تثق ── */}
      <HeroSection />
      <IhkaamTrustStats />

      {/* ── الفصل الثاني: المشكلة، والجواب، والطريق ── */}
      <PainSection />
      <SolutionPreviewSection />
      <HowItWorksSection />

      {/* ── الفصل الثالث: البرهان — بأصواتٍ ليست صوتنا ── */}
      <IhkaamPartners />
      <TestimonialsSection />
      <IhkaamSuccessStories />
      <IhkaamByNumbers />

      {/* ── الفصل الرابع: الدعوة ── */}
      <IhkaamCTABanner />
    </>
  )
}
