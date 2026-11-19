import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import FeatureCardVisual from './FeatureCardVisual'
import { useGalleryShots } from '../../hooks/useGalleryShots'
import { FEATURES, CORE, ADDONS } from '../../data/featureDetails'
import { FEATURE_SEO } from '../../config/seo'

/* روابط داخلية قابلة للزحف إلى صفحات الميزات كلها (ISS-10): روابط <a> حقيقية
   تظهر في HTML المُولَّد مسبقاً. تُستعمل في الرئيسية، وفي صفحة الميزة
   بصيغة «ميزات أخرى» عبر exclude. */
function featurePath(slug) {
  return ADDONS.includes(slug) ? `/ihkaam/addons/${slug}` : `/ihkaam/features/${slug}`
}

function featureLabel(slug) {
  return FEATURE_SEO[slug]?.title || FEATURES[slug]?.title || slug
}


function FeatureCard({ slug, shots, addon }) {
  const f = FEATURES[slug] || {}
  const Icon = f.icon
  return (
    <Link to={featurePath(slug)} className="feat-card group block rounded-[22px] overflow-hidden bg-white h-full"
          style={{ boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
      <div className="relative aspect-[16/10] overflow-hidden" style={{ background: 'linear-gradient(160deg,#0B3B33,#082C26)' }}>
        <div className="absolute inset-0 pattern-khatam" style={{ opacity: 0.08 }} aria-hidden />
        <FeatureCardVisual slug={slug} shots={shots} />
        {addon && <span className="absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold" style={{ background: '#E0B562', color: '#0B3B33' }}>إضافة</span>}
      </div>
      <div className="p-5 flex flex-col gap-2">
        <span className="flex items-center gap-2">
          {Icon && <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(31,111,82,0.08)', color: '#1F6F52' }}><Icon size={16} /></span>}
          <span className="text-lg font-bold" style={{ color: '#0B3B33' }}>{featureLabel(slug)}</span>
        </span>
        {f.subtitle && <span className="text-sm line-clamp-2" style={{ color: 'var(--text-2)', lineHeight: 1.75 }}>{f.subtitle}</span>}
        <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: '#8A6425' }}>
          اقرأ عن الميزة <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
        </span>
      </div>
    </Link>
  )
}

export default function FeatureLinksSection({
  exclude = null,
  title = 'ما الذي ستجده داخل إحكام',
  intro = 'كل صفحة تشرح ميزة واحدة: من يستخدمها، وما الذي يتغير في يوم المعهد بعدها.',
  as: Heading = 'h2',
  extraLinks = false,
  visual = false,
}) {
  const shots = useGalleryShots(visual)
  const core   = CORE.filter(s => FEATURES[s] && s !== exclude)
  const addons = ADDONS.filter(s => FEATURES[s] && s !== exclude)

  const group = (label, list) => list.length > 0 && (visual ? (
    <div>
      <h3 className="text-base font-bold mb-4" style={{ color: '#8A6425' }}>{label}</h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((slug) => <li key={slug}><FeatureCard slug={slug} shots={shots} addon={ADDONS.includes(slug)} /></li>)}
      </ul>
    </div>
  ) : (
    <div>
      <h3 className="text-xs font-black tracking-wide mb-3" style={{ color: '#5E6E67' }}>{label}</h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {list.map(slug => (
          <li key={slug}>
            <Link
              to={featurePath(slug)}
              className="block rounded-xl px-4 py-3 text-sm font-bold transition-colors hover:text-[#1F6F52]"
              style={{ color: '#1A2E28', background: 'rgba(11, 59, 51, 0.03)', border: '1px solid rgba(11, 59, 51, 0.07)' }}
            >
              {featureLabel(slug)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  ))

  return (
    <section dir="rtl" className={visual ? 'px-6 py-24' : 'px-6 py-16'} aria-label={title}>
      <div className={visual ? 'max-w-6xl mx-auto' : 'max-w-5xl mx-auto'}>
        {visual && <div className="text-center"><span className="eyebrow">اثنتا عشرة ميزة</span></div>}
        <Heading className={visual ? 'font-bold text-center mt-5 mb-3' : 'font-black text-2xl sm:text-3xl mb-2'} style={{ color: '#1A2E28', fontSize: visual ? 'clamp(2rem, 4vw, 3rem)' : undefined }}>{title}</Heading>
        {intro && <p className={visual ? 'text-lg text-center mb-12 mx-auto max-w-2xl' : 'text-sm leading-relaxed mb-8'} style={{ color: '#4A5D56' }}>{intro}</p>}
        <div className="space-y-8">
          {group('الميزات الأساسية', core)}
          {group('الإضافات المدفوعة', addons)}
        </div>
        {extraLinks && (
          <p className="mt-10 text-sm leading-loose" style={{ color: '#4A5D56' }}>
            تعرّف على <Link to="/about" className="font-bold underline underline-offset-4" style={{ color: '#1F6F52' }}>فريق منصة إحكام</Link>،
            أو اقرأ <Link to="/blog" className="font-bold underline underline-offset-4" style={{ color: '#1F6F52' }}>مدونة إحكام</Link>،
            أو تصفّح <Link to="/help" className="font-bold underline underline-offset-4" style={{ color: '#1F6F52' }}>مركز المساعدة</Link>.
          </p>
        )}
      </div>
    </section>
  )
}
