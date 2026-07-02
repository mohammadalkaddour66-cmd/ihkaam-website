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
      <HeroSection />
      <IhkaamTrustStats />
      <PainSection />
      <SolutionPreviewSection />
      <HowItWorksSection />
      <IhkaamPartners />
      <TestimonialsSection />
      <IhkaamSuccessStories />
      <IhkaamByNumbers />
      <IhkaamCTABanner />
    </>
  )
}
