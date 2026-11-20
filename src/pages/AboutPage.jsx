import AboutSection        from '../components/sections/AboutSection'
import TestimonialsSection from '../components/sections/TestimonialsSection'
import ClientReviewForm    from '../components/forms/ClientReviewForm'
import AffiliateInvite     from '../components/sections/AffiliateInvite'

export default function AboutPage() {
  return (
    <>
      <AboutSection />
      <TestimonialsSection titleLead="ماذا يقول" titleAccent="مديرو المعاهد عن إحكام" />
      <ClientReviewForm />
      <AffiliateInvite />
    </>
  )
}
