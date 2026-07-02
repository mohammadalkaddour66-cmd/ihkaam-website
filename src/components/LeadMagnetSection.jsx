import { useState } from 'react'
import { Download, Loader2, CheckCircle, Mail, TrendingUp, Bell } from 'lucide-react'
import { supabase } from '../config/supabaseClient'

/* ── Read UTM params + referrer from URL (client-side only) ── */
function getTrackingData() {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(window.location.search)
  return {
    utm_source  : p.get('utm_source')   || null,
    utm_medium  : p.get('utm_medium')   || null,
    utm_campaign: p.get('utm_campaign') || null,
    referrer    : document.referrer     || null,
  }
}

/* ── Copy variants ── */
const VARIANTS = {
  pdf: {
    badge        : 'ملف PDF مجاني',
    BadgeIcon    : Download,
    title        : 'لا تدع الإدارة اليدوية تستنزف طاقتك..',
    titleHighlight: 'احصل على دليل "الأتمتة الذكية" مجاناً.',
    desc         : 'خلاصة خبرة هندسية في دليل واحد. كيف تختار الأنظمة السحابية المناسبة، وتتخلص من المعاملات الورقية، وتوفر مئات الساعات شهرياً.',
    cta          : 'أرسل لي الدليل الآن',
    CtaIcon      : Download,
    successTitle : 'الدليل في طريقه إليك!',
    successMsg   : 'تحقق من بريدك الإلكتروني — سيصلك خلال دقائق.',
  },
  insights: {
    badge        : 'تقرير مجاني على بريدك',
    BadgeIcon    : TrendingUp,
    title        : 'هل تريد تقريراً شخصياً عن مركزك؟',
    titleHighlight: 'أرسل بريدك ونُرسله إليك مجاناً.',
    desc         : 'أدخل بريدك وسنرسل لك تقريراً يُظهر بالأرقام أين يقف مركزك مقارنةً بالشبكة، مع نصائح عملية لرفع كل مؤشر.',
    cta          : 'أرسل لي التقرير',
    CtaIcon      : TrendingUp,
    successTitle : 'التقرير في طريقه إليك!',
    successMsg   : 'تحقق من بريدك الإلكتروني — سيصلك خلال دقائق مع توصيات مخصصة لمركزك.',
  },
  blog: {
    badge        : 'مجاني تماماً',
    BadgeIcon    : Bell,
    title        : 'لا تفوّت المقالات القادمة.',
    titleHighlight: 'اشترك في نشرة إحكام الأسبوعية.',
    desc         : 'مقالات عملية عن إدارة مراكز التحفيظ — كل ثلاثاء مباشرة في بريدك. لا إعلانات، لا محتوى مبيعات.',
    cta          : 'اشترك في النشرة',
    CtaIcon      : Bell,
    successTitle : 'تم التسجيل!',
    successMsg   : 'ستصلك المقالات القادمة مباشرة في بريدك.',
  },
  ihkaam: {
    badge        : 'لا ضغط',
    BadgeIcon    : Mail,
    title        : 'لست مستعداً الآن؟',
    titleHighlight: 'ابقَ على تواصل — نُخبرك بكل جديد.',
    desc         : 'أحياناً التوقيت لا يناسب. أترك بريدك ونرسل لك مقارنة تفصيلية ودراسة حالة حقيقية عند جهوزيتك.',
    cta          : 'تواصلوا معي لاحقاً',
    CtaIcon      : Mail,
    successTitle : 'رائع! سنتواصل معك.',
    successMsg   : 'ستصلك رسالة قريباً مع معلومات مفيدة عن إحكام.',
  },
}

/* ── Main component ── */
export default function LeadMagnetSection({ sourcePage = '/', variant = 'pdf' }) {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [focused, setFocused] = useState(false)
  const [error,   setError]   = useState('')

  const v       = VARIANTS[variant] ?? VARIANTS.pdf
  const { BadgeIcon, CtaIcon } = v

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    setLoading(true)
    try {
      const { error: dbError } = await supabase
        .from('lead_magnet_subscribers')
        .insert([{
          email      : email.trim().toLowerCase(),
          source_page: sourcePage,
          variant,
          ...getTrackingData(),
        }])
      /* 23505 = unique_violation (duplicate email) — treat as success */
      if (dbError && dbError.code !== '23505') throw dbError
      setDone(true)
    } catch (err) {
      setError(err?.message || 'حدث خطأ في الاتصال. يرجى المحاولة مجدداً.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative z-10 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #010f0f 0%, #011a1a 45%, #012626 75%, #013030 100%)',
            border    : '1px solid rgba(217,172,163,0.14)',
            boxShadow : '0 0 80px rgba(217,172,163,0.06), 0 0 0 1px rgba(2,115,104,0.10)',
          }}
        >
          {/* Ambient glows */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(217,172,163,0.10) 0%, transparent 70%)' }} aria-hidden />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(2,115,104,0.12) 0%, transparent 70%)' }} aria-hidden />

          <div className="relative flex flex-col lg:flex-row items-center gap-10 px-8 py-12 md:px-14 md:py-14 text-start">

            {/* ── Text block ── */}
            <div className="flex-1">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full mb-6"
                style={{ background: 'rgba(2,89,81,0.60)', border: '1px solid rgba(2,115,104,0.35)', color: '#6ABDB2' }}
              >
                <BadgeIcon size={11} strokeWidth={2.2} />
                {v.badge}
              </span>

              <h2
                className="font-black leading-[1.55] mb-4"
                style={{ color: '#F0E8E5', fontSize: 'clamp(1.3rem, 2.8vw, 2rem)', maxWidth: '620px' }}
              >
                {v.title}{' '}
                <span className="text-rose-grad">{v.titleHighlight}</span>
              </h2>

              <p className="text-sm leading-[2]" style={{ color: '#7A9E96', maxWidth: '540px' }}>
                {v.desc}
              </p>
            </div>

            {/* ── Opt-in form ── */}
            <div className="w-full lg:w-auto lg:min-w-[340px]">
              {done ? (
                <div
                  className="flex flex-col items-center gap-4 rounded-2xl px-8 py-8 text-center"
                  style={{ background: 'rgba(2,89,81,0.25)', border: '1px solid rgba(2,115,104,0.22)' }}
                >
                  <CheckCircle size={36} style={{ color: '#D9ACA3' }} strokeWidth={1.4} />
                  <p className="font-bold text-sm" style={{ color: '#F0E8E5' }}>{v.successTitle}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#7A9E96' }}>{v.successMsg}</p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row lg:flex-col gap-3"
                  noValidate
                >
                  <input
                    type="email"
                    required
                    placeholder="بريدك الإلكتروني..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                      flex        : 1,
                      background  : 'rgba(1,38,38,0.70)',
                      border      : focused
                        ? '1px solid rgba(217,172,163,0.45)'
                        : '1px solid rgba(2,115,104,0.28)',
                      borderRadius: '0.875rem',
                      color       : '#F0E8E5',
                      fontSize    : '0.875rem',
                      padding     : '0.875rem 1.125rem',
                      outline     : 'none',
                      direction   : 'ltr',
                      textAlign   : 'right',
                      transition  : 'border-color 300ms ease, box-shadow 300ms ease',
                      boxShadow   : focused ? '0 0 0 3px rgba(217,172,163,0.07)' : 'none',
                      fontFamily  : 'inherit',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-cta flex items-center justify-center gap-2 font-bold rounded-xl cursor-pointer disabled:opacity-60 whitespace-nowrap"
                    style={{ padding: '0.875rem 1.5rem', fontSize: '0.875rem' }}
                  >
                    {loading ? (
                      <><Loader2 size={15} className="animate-spin" /> جاري الإرسال...</>
                    ) : (
                      <>{v.cta} <CtaIcon size={15} strokeWidth={2.2} /></>
                    )}
                  </button>
                </form>
              )}

              {!done && error && (
                <p
                  className="text-xs text-start rounded-xl px-4 py-3 mt-1"
                  style={{ color: '#D9ACA3', background: 'rgba(217,172,163,0.08)', border: '1px solid rgba(217,172,163,0.18)' }}
                >
                  {error}
                </p>
              )}
              {!done && !error && (
                <p className="text-center text-[11px] mt-3" style={{ color: '#2E4A40' }}>
                  لا رسائل مزعجة · بريدك آمن تماماً
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
