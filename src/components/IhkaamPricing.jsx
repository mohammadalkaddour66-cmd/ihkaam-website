import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, ChevronDown, Plus } from 'lucide-react'
import { usePricingRates } from '../hooks/usePricingRates'
import { supabase } from '../config/supabaseClient'
import { useIsMobile } from '../hooks/useIsMobile'
import { readPricingDraft, writePricingDraft } from '../config/pricingDraft'

const TIERS = [
  { max: 200,  name: 'المراكز الناشئة'   },
  { max: 500,  name: 'المعاهد المتوسطة' },
  { max: 1000, name: 'المجمعات الكبرى'  },
]

function getTier(students) {
  return TIERS.find(t => students <= t.max)
}

/* Hairline rule between the panel's steps */
function Rule() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.055)' }} aria-hidden />
}

/* Arabic count agreement: 1 مفردة، 2 مثنّى، 3–10 جمع، 11+ مفرد */
function featureCount(n) {
  if (n === 1) return 'ميزة'
  if (n === 2) return 'ميزتان'
  if (n <= 10) return `${n} ميزات`
  return `${n} ميزة`
}

/* No diacritics here on purpose — a damma+shadda ("مُفعَّلة") smears into an
   unreadable glyph at the pill's 0.7rem. */
function selectedCountLabel(n) {
  if (n === 1) return 'ميزة مختارة'
  if (n === 2) return 'ميزتان مختارتان'
  return `${featureCount(n)} مختارة`
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

function DurationSelector({ duration, onChange, discounts, enabledDurations }) {
  /* المدد التي يبيعها السوبر أدمن فعلاً. المفتاح غائب أو تالف →
     الأربعة كلها، وهو سلوك ما قبل الميزة حرفاً بحرف. */
  const options = DURATION_OPTIONS.filter(o => enabledDurations.includes(o.months))
  return (
    <div>
      <span className="block mb-2.5" style={{ color: '#6FA5A8', fontSize: '0.75rem', fontWeight: 500 }}>
        مدة الاشتراك
      </span>
      {/*
        dir="rtl" + DOM order [1,3,6,12] → visual right-to-left:
        [شهر] [3أشهر] [6أشهر] [سنة]  — 1 month on the right, 12 on the left.
        4-col grid (not inline-flex) so the pills share the width evenly and
        never crowd each other on narrow phones.
      */}
      <div
        dir="rtl"
        className="grid gap-1 rounded-2xl p-1"
        style={{
          /* كان grid-cols-4 مثبّتاً — فتعطيلُ مدّتين يترك زرّين
             في نصف صفّ وفراغاً بجانبهما. */
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
          background: 'rgba(2,15,14,0.60)',
          border    : '1px solid rgba(72,214,205,0.07)',
        }}
      >
        {options.map(({ months, label }) => {
          const discountPct = Math.round((discounts[months] ?? 0) * 100)
          const isActive    = duration === months

          return (
            <button
              key={months}
              onClick={() => onChange(months)}
              className="flex flex-col items-center justify-center rounded-xl cursor-pointer w-full"
              style={{
                paddingTop   : '0.45rem',
                paddingBottom: discountPct > 0 ? '0.30rem' : '0.45rem',
                paddingLeft  : '0.3rem',
                paddingRight : '0.3rem',
                background   : isActive ? 'rgba(72,214,205,0.15)' : 'transparent',
                boxShadow    : isActive ? 'inset 0 1px 0 rgba(72,214,205,0.18)' : 'none',
                border       : 'none',
                outline      : 'none',
                transition   : 'background 250ms cubic-bezier(0.4,0,0.2,1), box-shadow 250ms ease',
              }}
            >
              <span
                style={{
                  display      : 'block',
                  fontSize     : '0.85rem',
                  fontWeight   : isActive ? 700 : 500,
                  letterSpacing: '-0.01em',
                  lineHeight   : 1.2,
                  whiteSpace   : 'nowrap',
                  color        : isActive ? '#D4EAE7' : '#6FA5A8',
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
                    color     : isActive ? '#5AADA4' : '#1C423A',
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
    <div>
      {/* Header row — one line: label + tier name on the right, live count on the left */}
      <div className="flex items-center justify-between gap-3 mb-3.5" dir="rtl">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0" style={{ color: '#6FA5A8', fontSize: '0.75rem', fontWeight: 500 }}>
            عدد الطلاب
          </span>
          {tier && (
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#2C5C58' }} />
              <span className="text-[0.7rem] font-bold truncate" style={{ color: '#48D6CD' }}>
                {tier.name}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1.5 flex-shrink-0">
          <span
            className="font-black tabular-nums"
            style={{ color: '#48D6CD', fontSize: '1.45rem', lineHeight: 1 }}
          >
            {value}
          </span>
          <span style={{ color: '#6FA5A8', fontSize: '0.8rem' }}>طالب</span>
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
              background: `linear-gradient(to right, #48D6CD 0%, #48D6CD ${pct}%, rgba(9,32,30,0.70) ${pct}%, rgba(9,32,30,0.70) 100%)`,
            }}
          />
          {/* Tier boundary ticks — sit beneath the track.
              Hidden on mobile: the price is linear in student count, so the
              boundaries carry no cost consequence and only add clutter. */}
          {BOUNDARIES.map(b => (
            <div
              key={b}
              className="hidden sm:block absolute pointer-events-none"
              style={{
                left      : `calc(${sliderPct(b)}% - 0.5px)`,
                bottom    : -8,
                width     : 1,
                height    : 6,
                background: value >= b
                  ? 'rgba(72,214,205,0.50)'
                  : 'rgba(229,211,179,0.22)',
                transition: 'background 300ms ease',
              }}
            />
          ))}
        </div>

        {/* Min / max + boundary labels */}
        <div className="relative mt-2.5 sm:mt-5 flex items-center justify-between text-[0.68rem]" style={{ color: '#6FA5A8' }}>
          <span>10</span>
          {BOUNDARIES.map(b => (
            <span
              key={b}
              className="hidden sm:inline"
              style={{
                position  : 'absolute',
                left      : `${sliderPct(b)}%`,
                transform : 'translateX(-50%)',
                color     : value <= b && value > (b === 200 ? 0 : b === 500 ? 200 : 500)
                  ? '#48D6CD' : '#6FA5A8',
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
    <div dir="rtl">

      {/* ── Trigger row ───────────────────────────────────────────────
           This row kept reading as a section heading, so people scrolled
           past it. Three changes make it read as an action instead:
           a verb-led label ("أضف" not "ميزات…"), a + tile at the head of
           the row, and a tinted surface that separates it from the passive
           rows above and below. */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 cursor-pointer text-right"
        style={{
          background : selectedCount > 0 ? 'rgba(72,214,205,0.075)' : 'rgba(72,214,205,0.042)',
          border     : 'none',
          outline    : 'none',
          transition : 'background 200ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(72,214,205,0.10)' }}
        onMouseLeave={e => {
          e.currentTarget.style.background = selectedCount > 0
            ? 'rgba(72,214,205,0.075)' : 'rgba(72,214,205,0.042)'
        }}
      >
        {/* Right: + tile then the action label */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="flex items-center justify-center rounded-lg flex-shrink-0"
            style={{
              width     : 26,
              height    : 26,
              background: 'rgba(72,214,205,0.14)',
              border    : '1px solid rgba(72,214,205,0.28)',
            }}
          >
            <Plus size={14} strokeWidth={2.6} style={{ color: '#48D6CD' }} />
          </span>
          <span className="truncate" style={{ color: '#D4EAE7', fontSize: '0.85rem', fontWeight: 700 }}>
            أضف ميزات متقدمة
          </span>
        </div>

        {/* Left: state pill + rotating arrow */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="inline-flex items-center rounded-full"
            style={{
              padding   : '0.28rem 0.7rem',
              background: selectedCount > 0 ? 'rgba(72,214,205,0.20)' : 'transparent',
              border    : `1px solid ${selectedCount > 0 ? 'rgba(72,214,205,0.42)' : 'rgba(72,214,205,0.22)'}`,
              color     : selectedCount > 0 ? '#48D6CD' : '#7FB8B4',
              fontSize  : '0.7rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              transition: 'background 200ms ease, border-color 200ms ease, color 200ms ease',
            }}
          >
            {selectedCount > 0
              ? selectedCountLabel(selectedCount)
              : featureCount(storeFeatures.length)}
          </span>
          <ChevronDown
            size={16}
            strokeWidth={2.4}
            style={{
              color     : '#48D6CD',
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
            /* Same tint as the trigger, so open trigger + grid read as one block */
            style={{ overflow: 'hidden', background: 'rgba(72,214,205,0.042)' }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 px-4 sm:px-6 pb-5 pt-1 w-full">
              {storeFeatures.map(feature => {
                const isActive = selectedFeatures.has(feature.id)
                return (
                  <button
                    key={feature.id}
                    onClick={() => onToggleFeature(feature.id)}
                    title={feature.description || undefined}
                    className="flex flex-col justify-between gap-2 p-2.5 sm:p-3.5 rounded-xl cursor-pointer text-right"
                    style={{
                      background : isActive ? 'rgba(72,214,205,0.07)' : 'rgba(255,255,255,0.03)',
                      border     : `1px solid ${isActive ? 'rgba(72,214,205,0.30)' : 'rgba(255,255,255,0.05)'}`,
                      outline    : 'none',
                      minHeight  : '72px',
                      transition : 'background 200ms ease, border-color 200ms ease',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.borderColor = 'rgba(72,214,205,0.22)'
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                    }}
                  >
                    {/* Card top: name (right) + checkbox (left) */}
                    <div className="flex items-start justify-between gap-2">
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
                          background: isActive ? 'rgba(72,214,205,0.20)' : 'transparent',
                          border    : `1.5px solid ${isActive ? '#48D6CD' : 'rgba(65,121,119,0.32)'}`,
                          transition: 'background 200ms ease, border-color 200ms ease',
                        }}
                      >
                        {isActive && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
                            <path
                              d="M1 3L3 5L7 1"
                              stroke="#48D6CD"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Card bottom: price. The description lives in the card's
                        title attribute only — at this width it could never show
                        more than a truncated fragment. */}
                    <div className="flex items-baseline gap-0.5">
                      <span
                        dir="ltr"
                        className="tabular-nums"
                        style={{
                          color     : isActive ? '#48D6CD' : '#6FA5A8',
                          fontSize  : '0.82rem',
                          fontWeight: 600,
                          transition: 'color 200ms ease',
                        }}
                      >
                        +${(feature.price_usd_monthly || 0).toFixed(0)}
                      </span>
                      <span style={{ color: '#3D6B6B', fontSize: '0.62rem' }}>&nbsp;/ شهر</span>
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
  addonsMonthlyTotal = 0, ctaRef,
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
    /* Deeper surface than the rest of the panel — reads as the receipt total */
    <div
      className="px-4 sm:px-6 pt-5 pb-5"
      style={{ background: 'rgba(2,15,14,0.55)' }}
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
              style={{ color: '#96BCBE', fontSize: '0.90rem', maxWidth: 520, lineHeight: 1.9 }}
            >
              بنية تحتية مخصصة، SLA موثوق، وفريق دعم متخصص لمؤسستك.
            </p>
            <p
              className="mx-auto mb-8"
              style={{ color: '#6FA5A8', fontSize: '0.82rem', maxWidth: 480, lineHeight: 1.9 }}
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

            {/* ── Single price block — no line-item breakdown, just the number ── */}
            <div className="flex flex-col items-center text-center py-2">

              <span style={{ color: '#96BCBE', fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.4 }}>
                {totalLabel}
              </span>

              <div className="flex items-center justify-center gap-2.5 mt-2">
                <span
                  dir="ltr"
                  className="font-black tabular-nums"
                  style={{
                    color        : duration === 1 ? '#48D6CD' : '#D4EAE7',
                    fontSize     : 'clamp(2.1rem, 5vw, 2.9rem)',
                    lineHeight   : 1,
                    letterSpacing: '-0.03em',
                  }}
                >
                  ${periodTotal.toFixed(2)}
                </span>
                {discountPct > 0 && (
                  <span
                    className="rounded-full flex-shrink-0"
                    style={{
                      padding   : '0.22rem 0.62rem',
                      background: 'rgba(72,214,205,0.11)',
                      border    : '1px solid rgba(72,214,205,0.22)',
                      color     : '#5AADA4',
                      fontSize  : '0.62rem',
                      fontWeight: 700,
                      lineHeight: 1.4,
                    }}
                  >
                    <span dir="rtl" style={{ unicodeBidi: 'isolate' }}>
                      وفّر&nbsp;<span dir="ltr">{discountPct}%</span>
                    </span>
                  </span>
                )}
              </div>

              {/* Struck original — only when a duration discount applies */}
              {discountPct > 0 && (
                <span
                  className="mt-2"
                  style={{ color: '#364C54', fontSize: '0.74rem', lineHeight: 1.5 }}
                >
                  {originalLabel}:&nbsp;
                  <span
                    dir="ltr"
                    className="tabular-nums"
                    style={{ textDecoration: 'line-through', opacity: 0.45 }}
                  >
                    ${undiscounted.toFixed(2)}
                  </span>
                </span>
              )}

              {/* Scope line — what the number already covers. No per-item pricing. */}
              <span className="mt-2" style={{ color: '#6FA5A8', fontSize: '0.70rem', lineHeight: 1.6 }}>
                شامل {students} طالب
                {addonsMonthlyTotal > 0 && ' + الميزات المضافة'}
              </span>
            </div>

            {/* ── CTA — full-width, anchored to bottom ── */}
            <div className="flex flex-col mt-4">
              <button
                ref={ctaRef}
                onClick={onSubscribe}
                className="w-full font-black rounded-xl cursor-pointer"
                style={{
                  padding      : '0.85rem',
                  background   : '#48D6CD',
                  color        : '#09201E',
                  border       : 'none',
                  fontSize     : '0.95rem',
                  letterSpacing: '0.05em',
                  transition   : 'background 200ms ease, transform 150ms ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#48D6CD'
                  e.currentTarget.style.transform  = 'scale(1.01)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#48D6CD'
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
  /* Restore the plan the user built before going to checkout, so coming back
     doesn't reset them to 150 students / monthly / no add-ons. */
  const [draft] = useState(readPricingDraft)

  const [rawDuration, setDuration]            = useState(() => draft?.duration ?? 1)
  const [students, setStudents]               = useState(() => draft?.students ?? 150)
  const [isAddonsOpen, setAddonsOpen]         = useState(() => (draft?.selectedFeatureIds?.length ?? 0) > 0)
  const [storeFeatures, setStoreFeatures]     = useState([])
  const [selectedFeatures, setSelectedFeatures] = useState(() => new Set(draft?.selectedFeatureIds ?? []))
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const { baseFee, perStudent, discounts, enabledDurations } = usePricingRates()

  /* المدة الفعلية مشتقّة لا محفوظة.
     المصدر (rawDuration) قد يحمل مدةً عطّلها السوبر أدمن بعد أن حُفظت في
     مسوّدة المتصفّح — فزائرٌ بنى خطته على «6 أشهر» يعود إلى خيارٍ لا زرَّ له
     في الشريط. والاشتقاق يعالج معه الفارقَ بين أول رسمٍ (الأربعة الافتراضية)
     ووصولِ الإعداد من القاعدة.
     واخترناه على تصحيحٍ داخل useEffect لأن الحالة المشتقّة لا تُخزَّن: تصحيحُ
     الحالة في الأثر يرسم مرّتين، وقاعدة set-state-in-effect تمنعه. */
  const duration = enabledDurations.includes(rawDuration)
    ? rawDuration
    : (enabledDurations[0] ?? 1)

  /* Persist on every change — covers the in-app back button and the browser's
     own back gesture alike.
     يحفظ المدة **الفعلية** لا الخام، فالمسوّدة التي تحمل مدةً معطّلة تُشفى
     من نفسها بمجرّد فتح الصفحة بدل أن تبقى تحمل خياراً لا يُباع. */
  useEffect(() => {
    writePricingDraft({ duration, students, selectedFeatureIds: [...selectedFeatures] })
  }, [duration, students, selectedFeatures])

  const tier = getTier(students)

  /* The floating mobile CTA is a stand-in for the real one — it appears only
     while we're inside this section AND the real button is off-screen, so the
     two are never on screen together. */
  const sectionRef = useRef(null)
  const ctaRef     = useRef(null)
  const [inSection, setInSection] = useState(false)
  const [ctaOnScreen, setCtaOnScreen] = useState(true)

  useEffect(() => {
    if (!isMobile) return
    const watch = (el, set, opts) => {
      if (!el) return () => {}
      const io = new IntersectionObserver(([entry]) => set(entry.isIntersecting), opts)
      io.observe(el)
      return () => io.disconnect()
    }
    /* -84px bottom inset ≈ the floating bar's own height, so it fades in
       before it would cover the real button. */
    const offSection = watch(sectionRef.current, setInSection)
    const offCta     = watch(ctaRef.current, setCtaOnScreen, { rootMargin: '0px 0px -84px 0px' })
    return () => { offSection(); offCta() }
  }, [isMobile])

  const showFloatingCta = isMobile && inSection && !ctaOnScreen

  /* Lift Layout's WhatsApp button clear of the bar — only while it's up. */
  useEffect(() => {
    const root = document.documentElement
    if (showFloatingCta) root.style.setProperty('--wa-lift', '5.5rem')
    else                 root.style.removeProperty('--wa-lift')
    return () => root.style.removeProperty('--wa-lift')
  }, [showFloatingCta])

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
    <section ref={sectionRef} className="relative z-10 py-12 sm:py-16 px-5 sm:px-6" dir="rtl">

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
          background         : #48D6CD;
          cursor             : pointer;
          border             : 3px solid #09201E;
          box-shadow         : 0 0 0 2px rgba(72,214,205,0.35), 0 2px 8px rgba(0,0,0,0.45);
          transition         : box-shadow 150ms ease, transform 150ms ease;
        }
        .ihkaam-slider::-webkit-slider-thumb:hover {
          box-shadow : 0 0 0 5px rgba(72,214,205,0.22), 0 2px 8px rgba(0,0,0,0.45);
          transform  : scale(1.10);
        }
        .ihkaam-slider:active::-webkit-slider-thumb {
          box-shadow : 0 0 0 7px rgba(72,214,205,0.14), 0 2px 8px rgba(0,0,0,0.45);
          transform  : scale(1.15);
        }
        .ihkaam-slider::-moz-range-thumb {
          width         : 22px;
          height        : 22px;
          border-radius : 50%;
          background    : #48D6CD;
          cursor        : pointer;
          border        : 3px solid #09201E;
          box-shadow    : 0 0 0 2px rgba(72,214,205,0.35), 0 2px 8px rgba(0,0,0,0.45);
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
        style={{ background: 'radial-gradient(ellipse at top, rgba(72,214,205,0.05) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="max-w-5xl mx-auto">

        {/* Section header — the eyebrow repeats what the headline already says,
            so it only earns its space where space is plentiful. */}
        <div className="text-center mb-6 sm:mb-8">
          <span
            className="hidden sm:block text-xs font-semibold tracking-[0.22em] uppercase mb-3"
            style={{ color: '#A6756A' }}
          >
            باقات الاشتراك
          </span>
          <h2
            className="font-black leading-tight mx-auto"
            style={{ color: '#D9ACA3', fontSize: 'clamp(1.4rem, 3vw, 2.1rem)', maxWidth: 600 }}
          >
            صمم باقتك،{' '}
            <span style={{ color: '#EAE4DF' }}>على حجم معهدك تماماً</span>
          </h2>
        </div>

        {/* ── One panel, four steps, hairline dividers ──────────────────
             Previously each step carried its own border + background, so on
             a phone three competing frames stacked up. A single surface with
             internal rules reads as one form instead of three cards. */}
        <div
          className="max-w-2xl mx-auto rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(9,32,30,0.55)',
            border    : '1px solid rgba(255,255,255,0.07)',
            boxShadow : '0 24px 56px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          {/* 1 — duration */}
          <div className="px-4 sm:px-6 pt-5 pb-5">
            <DurationSelector
              duration={duration}
              onChange={setDuration}
              discounts={discounts}
              enabledDurations={enabledDurations}
            />
          </div>

          <Rule />

          {/* 2 — student count */}
          <div className="px-4 sm:px-6 py-5">
            <StudentSlider value={students} onChange={setStudents} tier={tier} />
          </div>

          {/* 3 — optional add-ons (absent until store_features loads) */}
          {storeFeatures.length > 0 && (
            <>
              <Rule />
              <AddonsBar
                isOpen={isAddonsOpen}
                onToggle={() => setAddonsOpen(prev => !prev)}
                storeFeatures={storeFeatures}
                selectedFeatures={selectedFeatures}
                onToggleFeature={toggleFeature}
              />
            </>
          )}

          <Rule />

          {/* 4 — total + CTA */}
          <SmartCard
            students={students}
            duration={duration}
            baseFee={baseFee}
            perStudent={perStudent}
            discounts={discounts}
            addonsMonthlyTotal={addonsMonthlyTotal}
            ctaRef={ctaRef}
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
        </div>

        <p className="text-center mt-4" style={{ color: '#3D6B6B', fontSize: '0.7rem' }}>
          بدون عقود ملزمة · تدفع حسب الاستخدام
        </p>

      </div>

      {/* ── Mobile: floating CTA — only while the real button is off-screen ──
           Rendered via portal to escape Layout's motion.main (Framer Motion leaves a
           lingering transform on it, which would otherwise break position:fixed here). */}
      {createPortal(
        <AnimatePresence>
          {showFloatingCta && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-0 bottom-0 z-40 px-4 pt-4"
              style={{
                paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
                background: 'linear-gradient(to top, #020F0E 55%, transparent)',
              }}
            >
              {/* Mirrors the in-panel total so the floating bar isn't a blind CTA */}
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
                  background   : '#48D6CD',
                  color        : '#09201E',
                  border       : 'none',
                  fontSize     : '0.95rem',
                  letterSpacing: '0.05em',
                  boxShadow    : '0 -4px 16px rgba(0,0,0,0.30), 0 8px 24px rgba(72,214,205,0.25)',
                }}
              >
                {tier.enterprise ? (<><MessageCircle size={16} /> تواصل معنا</>) : 'فعّل مركزك الآن'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  )
}
