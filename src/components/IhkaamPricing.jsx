import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, ChevronDown } from 'lucide-react'
import { usePricingRates } from '../hooks/usePricingRates'
import { supabase } from '../config/supabaseClient'
import { useIsMobile } from '../hooks/useIsMobile'

const TIERS = [
  { max: 200,  name: 'المراكز الناشئة'   },
  { max: 500,  name: 'المعاهد المتوسطة' },
  { max: 1000, name: 'المجمعات الكبرى'  },
]

function getTier(students) {
  return TIERS.find(t => students <= t.max)
}

/* ─────────────────────────────────────────────────────────────────────────
   DURATION OPTIONS — mirrors system_settings duration_discounts keys
   ───────────────────────────────────────────────────────────────────────── */

const DURATION_OPTIONS = [
  { months: 1,  label: 'شهر'    },
  { months: 3,  label: '3 أشهر' },
  { months: 6,  label: '6 أشهر' },
  { months: 12, label: 'سنة'    },
]

const PERIOD_LABEL = { 1: 'شهر', 3: '3 أشهر', 6: '6 أشهر', 12: 'سنة' }

/* ─────────────────────────────────────────────────────────────────────────
   DURATION SELECTOR
   4-pill horizontal segment bar. LTR container so pills read 1 → 12.
   Each pill shows the period label + a "وفّر X%" sub-badge when applicable.
   The 12-month pill carries an amber glow-dot to signal best value.
   ───────────────────────────────────────────────────────────────────────── */

function DurationSelector({ duration, onChange, discounts }) {
  return (
    <div className="flex justify-center mb-5">
      {/*
        dir="rtl" + DOM order [1,3,6,12] → visual right-to-left:
        [شهر] [3أشهر] [6أشهر] [سنة]  — 1 month on the right, 12 on the left.
      */}
      <div
        dir="rtl"
        className="inline-flex rounded-2xl p-1"
        style={{
          background: 'rgba(0,8,8,0.65)',
          border    : '1px solid rgba(0,168,150,0.07)',
        }}
      >
        {DURATION_OPTIONS.map(({ months, label }) => {
          const discountPct = Math.round((discounts[months] ?? 0) * 100)
          const isActive    = duration === months

          return (
            <button
              key={months}
              onClick={() => onChange(months)}
              className="flex flex-col items-center justify-center rounded-xl cursor-pointer"
              style={{
                paddingTop   : '0.38rem',
                paddingBottom: discountPct > 0 ? '0.25rem' : '0.38rem',
                paddingLeft  : '0.90rem',
                paddingRight : '0.90rem',
                minWidth     : '66px',
                background   : isActive ? 'rgba(0,168,150,0.15)' : 'transparent',
                boxShadow    : isActive ? 'inset 0 1px 0 rgba(0,168,150,0.18)' : 'none',
                border       : 'none',
                outline      : 'none',
                transition   : 'background 250ms cubic-bezier(0.4,0,0.2,1), box-shadow 250ms ease',
              }}
            >
              <span
                style={{
                  display      : 'block',
                  fontSize     : '0.875rem',
                  fontWeight   : isActive ? 700 : 500,
                  letterSpacing: '-0.01em',
                  lineHeight   : 1.2,
                  color        : isActive ? '#D4EAE7' : '#5A8A78',
                  transition   : 'color 250ms ease',
                }}
              >
                {label}
              </span>

              {discountPct > 0 && (
                <span
                  style={{
                    display   : 'block',
                    fontSize  : '0.58rem',
                    fontWeight: 500,
                    marginTop : '0.20rem',
                    lineHeight: 1,
                    color     : isActive ? '#5AADA4' : '#1A3828',
                    transition: 'color 250ms ease',
                  }}
                >
                  {/*
                    Bidi fix: isolate the RTL Arabic word and LTR numeric % in
                    explicit direction spans so the bidi algorithm cannot reorder
                    them. Result: Arabic "وفّر" on the right, "20%" to its left —
                    which an RTL reader reads as "وفّر 20%". ✓
                  */}
                  <span dir="rtl" style={{ unicodeBidi: 'isolate' }}>
                    وفّر&nbsp;<span dir="ltr">{discountPct}%</span>
                  </span>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   STUDENT SLIDER — 10 to 1000, step 10, default 150.
   Thin tick marks at tier boundaries (200 / 500 / 800).
   dir="ltr" on the input so values increase left→right regardless of RTL.
   ───────────────────────────────────────────────────────────────────────── */

const BOUNDARIES = [200, 500, 800]
const SLIDER_MIN  = 10
const SLIDER_MAX  = 1000

function sliderPct(val) {
  return ((val - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100
}

function StudentSlider({ value, onChange, tier }) {
  const pct = sliderPct(value)

  return (
    <div
      className="max-w-3xl mx-auto mb-4 px-5 py-4 rounded-2xl"
      style={{ background: 'rgba(1,38,38,0.45)', border: '1px solid rgba(2,115,104,0.18)' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3" dir="rtl">
        <span className="text-sm font-medium" style={{ color: '#7A9E96' }}>
          عدد الطلاب النشطين
        </span>
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-black tabular-nums"
            style={{ color: '#00A896', fontSize: '1.3rem', lineHeight: 1 }}
          >
            {value}
          </span>
          <span style={{ color: '#5A8A78', fontSize: '0.8rem' }}>طالب</span>
        </div>
      </div>

      {/* Track + ticks — forced LTR */}
      <div dir="ltr">
        <div className="relative">
          <input
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={10}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="ihkaam-slider"
            style={{
              background: `linear-gradient(to right, #00A896 0%, #00A896 ${pct}%, rgba(1,26,26,0.70) ${pct}%, rgba(1,26,26,0.70) 100%)`,
            }}
          />
          {/* Tier boundary ticks — sit beneath the track */}
          {BOUNDARIES.map(b => (
            <div
              key={b}
              className="absolute pointer-events-none"
              style={{
                left      : `calc(${sliderPct(b)}% - 0.5px)`,
                bottom    : -8,
                width     : 1,
                height    : 6,
                background: value >= b
                  ? 'rgba(0,168,150,0.50)'
                  : 'rgba(229,211,179,0.22)',
                transition: 'background 300ms ease',
              }}
            />
          ))}
        </div>

        {/* Min / max + boundary labels */}
        <div className="relative mt-5 flex items-center justify-between text-[0.68rem]" style={{ color: '#5A8A78' }}>
          <span>10</span>
          {BOUNDARIES.map(b => (
            <span
              key={b}
              style={{
                position  : 'absolute',
                left      : `${sliderPct(b)}%`,
                transform : 'translateX(-50%)',
                color     : value <= b && value > (b === 200 ? 0 : b === 500 ? 200 : 500)
                  ? '#00A896' : '#5A8A78',
                transition: 'color 300ms ease',
                fontWeight: value <= b && value > (b === 200 ? 0 : b === 500 ? 200 : 500)
                  ? 700 : 400,
              }}
            >
              {b}
            </span>
          ))}
          <span>1000</span>
        </div>
      </div>

      {/* Tier badge row */}
      {tier && (
        <div className="flex items-center gap-2 mt-4 pt-3" dir="rtl"
          style={{ borderTop: '1px solid rgba(0,168,150,0.10)' }}>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{
              background: 'rgba(0,168,150,0.10)',
              border    : '1px solid rgba(0,168,150,0.25)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: '#00A896', boxShadow: '0 0 5px rgba(0,168,150,0.65)' }} />
            <span className="text-[0.72rem] font-bold" style={{ color: '#00A896' }}>
              {tier.name}
            </span>
          </div>
          <span style={{ color: '#5A8A78', fontSize: '0.72rem' }}>تدفع حسب الاستخدام</span>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   ADD-ONS BAR — prominent trigger + animated grid of feature cards.
   Sits between StudentSlider and SmartCard; owns its own open/close state.
   ───────────────────────────────────────────────────────────────────────── */

function AddonsBar({ storeFeatures, selectedFeatures, onToggleFeature, isOpen, onToggle }) {
  if (!storeFeatures.length) return null

  const selectedCount = storeFeatures.filter(f => selectedFeatures.has(f.id)).length

  return (
    <div className="max-w-3xl mx-auto mb-4" dir="rtl">

      {/* ── Trigger action bar ── */}
      <button
        onClick={onToggle}
        className="w-full flex flex-row items-center justify-between p-3.5 sm:p-5 rounded-2xl cursor-pointer"
        style={{
          background : 'rgba(255,255,255,0.02)',
          border     : '1px solid rgba(255,255,255,0.10)',
          outline    : 'none',
          transition : 'background 200ms ease, border-color 200ms ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background   = 'rgba(255,255,255,0.04)'
          e.currentTarget.style.borderColor  = 'rgba(255,255,255,0.15)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background   = 'rgba(255,255,255,0.02)'
          e.currentTarget.style.borderColor  = 'rgba(255,255,255,0.10)'
        }}
      >
        {/* Right: headline + subtitle */}
        <div className="flex flex-col gap-1 text-right min-w-0">
          <span style={{ color: '#D4EAE7', fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.3 }}>
            تريد ترقية وتخصيص معهدك بميزات متقدمة؟
          </span>
          <span className="hidden sm:block" style={{ color: '#5A8A78', fontSize: '0.70rem', lineHeight: 1.5 }}>
            أضف حزم الإدارة المالية، الاختبارات، والمصادر الإضافية حسب رغبتك
          </span>
        </div>

        {/* Left: action pill + rotating arrow */}
        <div className="flex items-center gap-2.5 flex-shrink-0 mr-4">
          <span
            className="inline-flex items-center gap-1.5 rounded-full"
            style={{
              padding   : '0.38rem 0.90rem',
              background: selectedCount > 0 ? 'rgba(0,168,150,0.18)' : 'rgba(0,168,150,0.08)',
              border    : `1px solid ${selectedCount > 0 ? 'rgba(0,168,150,0.40)' : 'rgba(0,168,150,0.20)'}`,
              color     : selectedCount > 0 ? '#6ABDB2' : '#5A8A78',
              fontSize  : '0.72rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              transition: 'background 200ms ease, border-color 200ms ease, color 200ms ease',
            }}
          >
            {selectedCount > 0 ? `${selectedCount} ميزات مُفعَّلة ✨` : 'تخصيص الحزمة ✨'}
          </span>
          <ChevronDown
            size={15}
            style={{
              color     : '#5A8A78',
              transform : isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
              flexShrink: 0,
            }}
          />
        </div>
      </button>

      {/* ── Expandable grid of feature cards ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="addons-grid"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.30, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 mt-4 w-full">
              {storeFeatures.map(feature => {
                const isActive = selectedFeatures.has(feature.id)
                return (
                  <button
                    key={feature.id}
                    onClick={() => onToggleFeature(feature.id)}
                    className="flex flex-col justify-between p-2.5 sm:p-4 rounded-xl cursor-pointer text-right"
                    style={{
                      background : isActive ? 'rgba(0,168,150,0.07)' : 'rgba(255,255,255,0.03)',
                      border     : `1px solid ${isActive ? 'rgba(0,168,150,0.30)' : 'rgba(255,255,255,0.05)'}`,
                      outline    : 'none',
                      minHeight  : '92px',
                      transition : 'background 200ms ease, border-color 200ms ease',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.borderColor = 'rgba(0,168,150,0.22)'
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                    }}
                  >
                    {/* Card top: name (right) + checkbox (left) */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <span style={{
                        color     : isActive ? '#D4EAE7' : '#8AADA8',
                        fontSize  : '0.80rem',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        textAlign : 'right',
                        transition: 'color 200ms ease',
                      }}>
                        {feature.name}
                      </span>

                      {/* Custom checkbox */}
                      <div
                        className="flex-shrink-0 flex items-center justify-center rounded"
                        style={{
                          marginTop : '0.08rem',
                          width     : 16,
                          height    : 16,
                          background: isActive ? 'rgba(0,168,150,0.20)' : 'transparent',
                          border    : `1.5px solid ${isActive ? '#00A896' : 'rgba(74,112,96,0.32)'}`,
                          transition: 'background 200ms ease, border-color 200ms ease',
                        }}
                      >
                        {isActive && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
                            <path
                              d="M1 3L3 5L7 1"
                              stroke="#00A896"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Card middle: truncated single-line description */}
                    <p
                      className="truncate mb-3"
                      style={{ color: '#5A8A78', fontSize: '0.67rem', lineHeight: 1.5 }}
                      title={feature.description}
                    >
                      {feature.description || '—'}
                    </p>

                    {/* Card bottom: price */}
                    <div className="flex items-baseline gap-0.5">
                      <span
                        dir="ltr"
                        className="tabular-nums"
                        style={{
                          color     : isActive ? '#6ABDB2' : '#2E5048',
                          fontSize  : '0.82rem',
                          fontWeight: 600,
                          transition: 'color 200ms ease',
                        }}
                      >
                        +${(feature.price_usd_monthly || 0).toFixed(0)}
                      </span>
                      <span style={{ color: '#243830', fontSize: '0.62rem' }}>&nbsp;/ شهر</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   SMART CARD — switches between Enterprise and Normal layouts.
   Normal layout: vertical premium stack (4 blocks top→bottom).
   Enterprise layout: centered, contact CTA.
   ───────────────────────────────────────────────────────────────────────── */

function SmartCard({
  students, duration, onSubscribe, onContact, baseFee, perStudent, discounts,
  addonsMonthlyTotal = 0,
}) {
  const tier            = getTier(students)
  const discountFrac    = discounts[duration] ?? 0
  const discountPct     = Math.round(discountFrac * 100)
  const studentFeeM     = students * perStudent
  const monthlyBase     = baseFee + studentFeeM
  const monthlyTotal    = monthlyBase + addonsMonthlyTotal
  const undiscounted    = monthlyTotal * duration
  const periodTotal     = undiscounted * (1 - discountFrac)

  const totalLabel = duration === 1
    ? 'المجموع الشهري'
    : duration === 12
      ? 'المجموع النهائي للسنة'
      : `المجموع النهائي لـ ${PERIOD_LABEL[duration]}`

  const originalLabel = duration === 12
    ? 'المجموع الأصلي للسنة'
    : `المجموع الأصلي لـ ${PERIOD_LABEL[duration]}`

  return (
    <div
      className="max-w-3xl mx-auto mt-4 rounded-2xl"
      style={{
        background: '#011A1A',
        border    : '1px solid rgba(229,211,179,0.10)',
        padding   : '1.1rem 1.4rem',
        boxShadow : '0 24px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(229,211,179,0.04)',
      }}
    >
      <AnimatePresence mode="wait">

        {/* ── ENTERPRISE MODE (> 800 students) ── */}
        {tier.enterprise ? (
          <motion.div
            key="enterprise"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="text-center py-4"
            dir="rtl"
          >
            {/* Tier badge */}
            <div className="flex justify-center mb-5">
              <span
                className="inline-flex items-center gap-2 rounded-full px-5 py-2"
                style={{
                  background: 'rgba(229,211,179,0.08)',
                  border    : '1px solid rgba(229,211,179,0.20)',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#E5D3B3', boxShadow: '0 0 7px rgba(229,211,179,0.60)' }}
                />
                <span style={{ color: '#E5D3B3', fontSize: '0.85rem', fontWeight: 700 }}>
                  {tier.name}
                </span>
              </span>
            </div>

            <p
              className="mx-auto mb-2"
              style={{ color: '#7A9E96', fontSize: '0.90rem', maxWidth: 520, lineHeight: 1.9 }}
            >
              بنية تحتية مخصصة، SLA موثوق، وفريق دعم متخصص لمؤسستك.
            </p>
            <p
              className="mx-auto mb-8"
              style={{ color: '#5A8A78', fontSize: '0.82rem', maxWidth: 480, lineHeight: 1.9 }}
            >
              نسعد بتصميم حزمة تناسب حجمك تماماً — تواصل معنا وسنعدّ لك عرضاً في 24 ساعة.
            </p>

            <button
              onClick={onContact}
              className="inline-flex items-center gap-2.5 font-bold rounded-xl px-8 py-3.5 cursor-pointer text-sm"
              style={{
                background: 'rgba(229,211,179,0.10)',
                border    : '1px solid rgba(229,211,179,0.28)',
                color     : '#E5D3B3',
                transition: 'background 250ms ease, border-color 250ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = 'rgba(229,211,179,0.18)'
                e.currentTarget.style.borderColor = 'rgba(229,211,179,0.50)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = 'rgba(229,211,179,0.10)'
                e.currentTarget.style.borderColor = 'rgba(229,211,179,0.28)'
              }}
            >
              <MessageCircle size={16} />
              تواصل معنا
            </button>
          </motion.div>

        ) : (

          /* ── NORMAL MODE — horizontal premium line-item block ── */
          <motion.div
            key="normal"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            dir="rtl"
            className="flex flex-col"
          >

            {/* ── Breakdown columns — stacked rows on mobile, horizontal columns from sm ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between w-full">

              {/* Col 1 (rightmost): Platform fee */}
              <div className="flex flex-row items-baseline justify-between gap-2 w-full sm:w-auto sm:flex-col sm:gap-1.5 sm:items-start min-w-0">
                <span style={{ color: '#5A8A84', fontSize: '0.72rem', lineHeight: 1.4 }}>
                  رسوم المنصة الثابتة
                </span>
                <div className="flex items-baseline gap-0.5 flex-shrink-0">
                  <span
                    dir="ltr"
                    className="tabular-nums font-semibold"
                    style={{ color: '#B0C4BE', fontSize: '0.95rem' }}
                  >
                    ${baseFee.toFixed(2)}
                  </span>
                  <span style={{ color: '#5A8A78', fontSize: '0.65rem' }}>&nbsp;/ شهر</span>
                </div>
              </div>

              {/* Col 2: Student fee */}
              <div className="flex flex-row items-baseline justify-between gap-2 w-full sm:w-auto sm:flex-col sm:gap-1.5 sm:items-start min-w-0">
                <span style={{ color: '#5A8A84', fontSize: '0.72rem', lineHeight: 1.4 }}>
                  رسوم الطلاب ({students} طالب)
                </span>
                <div className="flex items-baseline gap-0.5 flex-shrink-0">
                  <span
                    dir="ltr"
                    className="tabular-nums font-semibold"
                    style={{ color: '#00A896', fontSize: '0.95rem' }}
                  >
                    ${studentFeeM.toFixed(2)}
                  </span>
                  <span style={{ color: '#5A8A78', fontSize: '0.65rem' }}>&nbsp;/ شهر</span>
                </div>
              </div>

              {/* Col 2.5: Active add-ons aggregate — shown only when total > 0 */}
              {addonsMonthlyTotal > 0 && (
                <div className="flex flex-row items-baseline justify-between gap-2 w-full sm:w-auto sm:flex-col sm:gap-1.5 sm:items-start min-w-0">
                  <span style={{ color: '#5A8A84', fontSize: '0.72rem', lineHeight: 1.4 }}>
                    الميزات المضافة
                  </span>
                  <div className="flex items-baseline gap-0.5 flex-shrink-0">
                    <span
                      dir="ltr"
                      className="tabular-nums font-semibold"
                      style={{ color: '#6ABDB2', fontSize: '0.95rem' }}
                    >
                      +${addonsMonthlyTotal.toFixed(2)}
                    </span>
                    <span style={{ color: '#5A8A78', fontSize: '0.65rem' }}>&nbsp;/ شهر</span>
                  </div>
                </div>
              )}

              {/* Col 3: Original subtotal — only when a discount applies */}
              {discountPct > 0 && (
                <div className="flex flex-row items-baseline justify-between gap-2 w-full sm:w-auto sm:flex-col sm:gap-1.5 sm:items-start min-w-0">
                  <span style={{ color: '#3A5050', fontSize: '0.72rem', lineHeight: 1.4 }}>
                    {originalLabel}
                  </span>
                  <span
                    dir="ltr"
                    className="tabular-nums"
                    style={{
                      color         : '#3A5050',
                      fontSize      : '0.82rem',
                      textDecoration: 'line-through',
                      opacity       : 0.30,
                    }}
                  >
                    ${undiscounted.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Col 4 (leftmost): Grand total hero */}
              <div
                className="flex flex-row items-center justify-between gap-2 w-full sm:w-auto sm:flex-col sm:gap-1.5 sm:items-start min-w-0 border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <span style={{ color: '#7A9E96', fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.4 }}>
                  {totalLabel}
                </span>
                <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-0.5 flex-shrink-0">
                  <span
                    dir="ltr"
                    className="font-black tabular-nums"
                    style={{
                      color        : duration === 1 ? '#00A896' : '#D4EAE7',
                      fontSize     : 'clamp(1.3rem, 2.5vw, 1.7rem)',
                      lineHeight   : 1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    ${periodTotal.toFixed(2)}
                  </span>
                  {discountPct > 0 && (
                    <span
                      className="rounded-full"
                      style={{
                        padding   : '0.18rem 0.55rem',
                        background: 'rgba(0,168,150,0.11)',
                        border    : '1px solid rgba(0,168,150,0.22)',
                        color     : '#5AADA4',
                        fontSize  : '0.60rem',
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      <span dir="rtl" style={{ unicodeBidi: 'isolate' }}>
                        وفّر&nbsp;<span dir="ltr">{discountPct}%</span>
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Subtle divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0.75rem 0' }} />

            {/* ── CTA — full-width, anchored to bottom ── */}
            <div className="flex flex-col">
              <button
                onClick={onSubscribe}
                className="w-full font-black rounded-xl cursor-pointer"
                style={{
                  padding      : '0.75rem',
                  background   : '#00A896',
                  color        : '#011A1A',
                  border       : 'none',
                  fontSize     : '0.95rem',
                  letterSpacing: '0.05em',
                  transition   : 'background 200ms ease, transform 150ms ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#00C4B4'
                  e.currentTarget.style.transform  = 'scale(1.01)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#00A896'
                  e.currentTarget.style.transform  = 'scale(1)'
                }}
              >
                فعّل مركزك الآن
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
   ───────────────────────────────────────────────────────────────────────── */

export default function IhkaamPricing() {
  const [duration, setDuration]               = useState(1)
  const [students, setStudents]               = useState(150)
  const [isAddonsOpen, setAddonsOpen]         = useState(false)
  const [storeFeatures, setStoreFeatures]     = useState([])
  const [selectedFeatures, setSelectedFeatures] = useState(new Set())
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const { baseFee, perStudent, discounts } = usePricingRates()
  const tier = getTier(students)

  useEffect(() => {
    supabase
      .from('store_features')
      .select('id, name, description, price_usd_monthly')
      .eq('is_visible', true)
      .eq('is_deleted', false)
      .then(({ data }) => { if (data) setStoreFeatures(data) })
  }, [])

  function toggleFeature(id) {
    setSelectedFeatures(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const addonsMonthlyTotal = storeFeatures
    .filter(f => selectedFeatures.has(f.id))
    .reduce((sum, f) => sum + (f.price_usd_monthly || 0), 0)

  return (
    <section className="relative z-10 py-14 px-6" style={isMobile ? { paddingBottom: '6.5rem' } : undefined} dir="rtl">

      {/* Slider thumb/track pseudo-element styles — scoped by class name */}
      <style>{`
        .ihkaam-slider {
          -webkit-appearance : none;
          appearance         : none;
          width              : 100%;
          height             : 6px;
          border-radius      : 999px;
          outline            : none;
          cursor             : pointer;
          display            : block;
        }
        .ihkaam-slider::-webkit-slider-thumb {
          -webkit-appearance : none;
          appearance         : none;
          width              : 22px;
          height             : 22px;
          border-radius      : 50%;
          background         : #00A896;
          cursor             : pointer;
          border             : 3px solid #011A1A;
          box-shadow         : 0 0 0 2px rgba(0,168,150,0.35), 0 2px 8px rgba(0,0,0,0.45);
          transition         : box-shadow 150ms ease, transform 150ms ease;
        }
        .ihkaam-slider::-webkit-slider-thumb:hover {
          box-shadow : 0 0 0 5px rgba(0,168,150,0.22), 0 2px 8px rgba(0,0,0,0.45);
          transform  : scale(1.10);
        }
        .ihkaam-slider:active::-webkit-slider-thumb {
          box-shadow : 0 0 0 7px rgba(0,168,150,0.14), 0 2px 8px rgba(0,0,0,0.45);
          transform  : scale(1.15);
        }
        .ihkaam-slider::-moz-range-thumb {
          width         : 22px;
          height        : 22px;
          border-radius : 50%;
          background    : #00A896;
          cursor        : pointer;
          border        : 3px solid #011A1A;
          box-shadow    : 0 0 0 2px rgba(0,168,150,0.35), 0 2px 8px rgba(0,0,0,0.45);
        }
        .ihkaam-slider::-moz-range-track {
          height        : 6px;
          border-radius : 999px;
          background    : transparent;
        }
      `}</style>

      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(217,172,163,0.18), transparent)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px]"
        style={{ background: 'radial-gradient(ellipse at top, rgba(0,168,150,0.05) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="max-w-5xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-6">
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase block mb-3"
            style={{ color: '#A6756A' }}
          >
            باقات الاشتراك
          </span>
          <h2
            className="font-black leading-tight mx-auto"
            style={{ color: '#D9ACA3', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', maxWidth: 600 }}
          >
           صمم باقتك،{' '}
            <span style={{ color: '#F0E8E5' }}>على حجم معهدك تماما</span>
          </h2>
        </div>

        {/* Duration selector */}
        <DurationSelector
          duration={duration}
          onChange={setDuration}
          discounts={discounts}
        />

        {/* Student count slider */}
        <StudentSlider value={students} onChange={setStudents} tier={tier} />

        {/* Add-ons selector — prominent bar + animated feature grid */}
        <AddonsBar
          isOpen={isAddonsOpen}
          onToggle={() => setAddonsOpen(prev => !prev)}
          storeFeatures={storeFeatures}
          selectedFeatures={selectedFeatures}
          onToggleFeature={toggleFeature}
        />

        {/* Dynamic smart card */}
        <SmartCard
          students={students}
          duration={duration}
          baseFee={baseFee}
          perStudent={perStudent}
          discounts={discounts}
          addonsMonthlyTotal={addonsMonthlyTotal}
          onSubscribe={() =>
            navigate('/checkout', {
              state: {
                tierName          : tier.name,
                students,
                duration,
                selectedFeatureIds: [...selectedFeatures],
              },
            })
          }
          onContact={() => navigate('/contact')}
        />

        {/* Math footnote */}
        <div className="text-center mt-4 space-y-1" dir="rtl">
          <p style={{ color: '#5A8A78', fontSize: '0.72rem', lineHeight: 1.9 }}>
            السعر الشهري: ${baseFee} + عدد الطلاب × ${perStudent} شهرياً
          </p>
          <p style={{ color: '#5A8A78', fontSize: '0.72rem', lineHeight: 1.9 }}>
            الخصومات:{' '}
            3 أشهر وفّر {Math.round((discounts[3] ?? 0) * 100)}%
            {' · '}
            6 أشهر وفّر {Math.round((discounts[6] ?? 0) * 100)}%
            {' · '}
            سنوياً وفّر {Math.round((discounts[12] ?? 0) * 100)}%
          </p>
        </div>

      </div>

      {/* ── Mobile: persistent floating action bar so the CTA is always reachable ──
           Rendered via portal to escape Layout's motion.main (Framer Motion leaves a
           lingering transform on it, which would otherwise break position:fixed here). */}
      {isMobile && createPortal(
        <div
          className="fixed inset-x-0 bottom-0 z-40 px-4 pt-3"
          style={{
            paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
            background: 'linear-gradient(to top, #010D0D 60%, transparent)',
          }}
        >
          <button
            onClick={tier.enterprise ? () => navigate('/contact') : () => navigate('/checkout', {
              state: {
                tierName          : tier.name,
                students,
                duration,
                selectedFeatureIds: [...selectedFeatures],
              },
            })}
            className="w-full font-black rounded-xl cursor-pointer flex items-center justify-center gap-2"
            style={{
              padding      : '0.9rem',
              background   : '#00A896',
              color        : '#011A1A',
              border       : 'none',
              fontSize     : '0.95rem',
              letterSpacing: '0.05em',
              boxShadow    : '0 -4px 16px rgba(0,0,0,0.30), 0 8px 24px rgba(0,168,150,0.25)',
            }}
          >
            {tier.enterprise ? (<><MessageCircle size={16} /> تواصل معنا</>) : 'فعّل مركزك الآن'}
          </button>
        </div>,
        document.body
      )}
    </section>
  )
}
