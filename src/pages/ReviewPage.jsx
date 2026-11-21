import ClientReviewForm from '../components/forms/ClientReviewForm'
import PageNotes from '../components/sections/PageNotes'
import SceneFrame from '../components/layout/SceneFrame'

const NOTES = [
  { q: 'لمن هذه الصفحة؟', a: 'لمديري المعاهد والمراكز الذين يستعملون إحكام فعلاً. رأيك يفيد مديراً آخر يقف حيث وقفت قبل أن تبدأ، ويفيدنا في معرفة ما يحتاج إلى تحسين.' },
  { q: 'ماذا أكتب في التقييم؟', a: 'اكتب ما تغيّر في عملك اليومي بعد استعمال النظام، ولو كان شيئاً صغيراً: سجلّ حضور صار أسرع، أو سؤال من وليّ أمر لم يعد يتكرر. المثال الواحد الصادق أنفع من المديح العام. وإن وجدت شيئاً مزعجاً فاذكره كذلك.' },
  { q: 'هل يُنشر تقييمي كما هو؟', a: 'نراجع التقييمات قبل عرضها على الموقع، ولا نغيّر كلامك. إن فضّلت ألا يظهر اسم معهدك فاذكر ذلك في رسالتك ونأخذ به.' },
]

/* خلوص الشريط العلوي الثابت (h-16) يُضاف هنا لا داخل النموذج:
   AboutPage يضمّ النموذج نفسه في وسط الصفحة، فحشوةٌ علوية داخله
   تفتح فجوة هناك بلا سبب. */
export default function ReviewPage() {
  return (
    <div className="pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <SceneFrame src="/scenes/page-review.webp" aspect="aspect-[21/7] sm:aspect-[21/6]" line="رأيك يفيد مديراً آخر" sub="يقف حيث وقفتَ قبل أن تبدأ." eager />
      </div>
      <ClientReviewForm headingLevel="h1" />
      <PageNotes title="عن التقييم" items={NOTES} />
    </div>
  )
}
