import { Link } from 'react-router-dom'
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

export default function FeatureLinksSection({
  exclude = null,
  title = 'ما الذي ستجده داخل إحكام',
  intro = 'كل صفحة تشرح ميزة واحدة: من يستخدمها، وما الذي يتغير في يوم المعهد بعدها.',
  as: Heading = 'h2',
  extraLinks = false,
}) {
  const core   = CORE.filter(s => FEATURES[s] && s !== exclude)
  const addons = ADDONS.filter(s => FEATURES[s] && s !== exclude)

  const group = (label, list) => list.length > 0 && (
    <div>
      <h3 className="text-xs font-black tracking-wide mb-3" style={{ color: '#6FA5A8' }}>{label}</h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {list.map(slug => (
          <li key={slug}>
            <Link
              to={featurePath(slug)}
              className="block rounded-xl px-4 py-3 text-sm font-bold transition-colors hover:text-[#48D6CD]"
              style={{ color: '#EAE4DF', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {featureLabel(slug)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <section dir="rtl" className="px-6 py-16" aria-label={title}>
      <div className="max-w-5xl mx-auto">
        <Heading className="font-black text-2xl sm:text-3xl mb-2" style={{ color: '#EAE4DF' }}>{title}</Heading>
        {intro && <p className="text-sm leading-relaxed mb-8" style={{ color: '#96BCBE' }}>{intro}</p>}
        <div className="space-y-8">
          {group('الميزات الأساسية', core)}
          {group('الإضافات المدفوعة', addons)}
        </div>
        {extraLinks && (
          <p className="mt-10 text-sm leading-loose" style={{ color: '#96BCBE' }}>
            تعرّف على <Link to="/about" className="font-bold underline underline-offset-4" style={{ color: '#48D6CD' }}>فريق منصة إحكام</Link>،
            أو اقرأ <Link to="/blog" className="font-bold underline underline-offset-4" style={{ color: '#48D6CD' }}>مدونة إحكام</Link>،
            أو تصفّح <Link to="/help" className="font-bold underline underline-offset-4" style={{ color: '#48D6CD' }}>مركز المساعدة</Link>.
          </p>
        )}
      </div>
    </section>
  )
}
