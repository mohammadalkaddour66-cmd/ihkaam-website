import { Component } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'

/**
 * Catches render-time errors anywhere below it so a single broken component
 * shows a recoverable screen instead of a blank white page.
 *
 * Must stay a class — React has no hook equivalent for componentDidCatch.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Kept as console output — no error-reporting service wired up yet.
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <section
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center overflow-hidden"
        style={{ background: '#F8F5EC' }}
        dir="rtl"
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse, rgba(184, 134, 58, 0.07) 0%, transparent 70%)' }}
          aria-hidden
        />

        <div className="relative flex flex-col items-center gap-6">

          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold tracking-widest uppercase"
            style={{
              background: 'rgba(184, 134, 58, 0.10)',
              border    : '1px solid rgba(184, 134, 58, 0.28)',
              color     : '#8A6425',
            }}
          >
            خطأ غير متوقّع
          </span>

          <h1
            className="font-black"
            style={{ color: '#1A2E28', fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}
          >
            تعذّر عرض هذه الصفحة
          </h1>

          <p className="text-sm max-w-sm" style={{ color: '#5E6E67', lineHeight: 1.9 }}>
            حدث خلل أثناء التحميل. جرّب إعادة التحميل — وإن تكرّر الأمر تواصل معنا وسنعالجه.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre
              dir="ltr"
              className="max-w-lg overflow-auto rounded-xl p-4 text-start text-[11px]"
              style={{
                background: 'rgba(253, 251, 247, 0.80)',
                border    : '1px solid rgba(31, 111, 82, 0.18)',
                color     : '#872727',
              }}
            >
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <button
              onClick={() => window.location.reload()}
              className="btn-cta inline-flex items-center gap-2.5 rounded-xl"
              style={{ fontSize: '0.95rem', padding: '0.85rem 2rem', cursor: 'pointer' }}
            >
              إعادة التحميل
              <RotateCcw size={15} />
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold transition-colors duration-300"
              style={{
                color     : '#4A5D56',
                background: 'rgba(241, 236, 223, 0.18)',
                border    : '1px solid rgba(11, 59, 51, 0.22)',
                padding   : '0.85rem 1.6rem',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1A2E28')}
              onMouseLeave={e => (e.currentTarget.style.color = '#4A5D56')}
            >
              العودة للرئيسية
            </Link>
          </div>

        </div>
      </section>
    )
  }
}
