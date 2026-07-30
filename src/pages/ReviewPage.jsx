import ClientReviewForm from '../components/ClientReviewForm'

/* خلوص الشريط العلوي الثابت (h-16) يُضاف هنا لا داخل النموذج:
   AboutPage يضمّ النموذج نفسه في وسط الصفحة، فحشوةٌ علوية داخله
   تفتح فجوة هناك بلا سبب. */
export default function ReviewPage() {
  return (
    <div className="pt-16">
      <ClientReviewForm />
    </div>
  )
}
