import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../config/supabaseClient'

const inputBase = {
  background  : 'rgba(11, 59, 51, 0.04)',
  borderWidth : '1px',
  borderStyle : 'solid',
  borderColor : 'rgba(184, 134, 58, 0.22)',
  borderRadius: '0.875rem',
  color       : '#1A2E28',
  fontSize    : '0.9rem',
  padding     : '0.875rem 1.125rem',
  width       : '100%',
  outline     : 'none',
  transition  : 'border-color 300ms ease, box-shadow 300ms ease',
  direction   : 'rtl',
  fontFamily  : 'inherit',
}
const inputFocus = {
  borderColor: 'rgba(184, 134, 58, 0.55)',
  boxShadow  : '0 0 0 3px rgba(184, 134, 58, 0.08)',
}

export default function AdminLogin() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [focused,  setFocused]  = useState('')
  const navigate = useNavigate()

  const f = (key) => ({ ...inputBase, ...(focused === key ? inputFocus : {}) })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr) throw authErr
      navigate('/admin', { replace: true })
    } catch (err) {
      console.error('[AdminLogin] Auth error:', err?.message)
      setError(
        err?.message === 'Invalid login credentials'
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
          : err?.message || 'حدث خطأ أثناء تسجيل الدخول.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      dir="rtl"
      style={{ background: '#FFFFFF', fontFamily: 'inherit' }}
    >
      {/* Ambient glows */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 25% 35%, rgba(255, 255, 255, 0.50) 0%, transparent 65%)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 80% 75%, rgba(122, 90, 46, 0.08) 0%, transparent 60%)' }}
        aria-hidden
      />

      {/* Login card */}
      <div
        className="relative w-full max-w-md rounded-3xl p-8 md:p-10"
        style={{
          background          : 'rgba(241, 236, 223, 0.14)',
          border              : '1px solid rgba(184, 134, 58, 0.16)',
          backdropFilter      : 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow           : '0 32px 80px rgba(248, 245, 236, 0.55)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-5"
            style={{
              background: 'rgba(184, 134, 58, 0.12)',
              border    : '1px solid rgba(184, 134, 58, 0.25)',
            }}
          >
            ⚙️
          </div>
          <span
            className="text-[10px] font-semibold tracking-[0.22em] uppercase block mb-2"
            style={{ color: '#7A5A2E' }}
          >
            غرفة القيادة
          </span>
          <h1 className="text-2xl font-black mb-2" style={{ color: '#1A2E28' }}>
            تسجيل الدخول
          </h1>
          <p className="text-xs" style={{ color: '#5E6E67' }}>
            منطقة مقيدة — لمشرف المنصة فقط
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5" noValidate>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-semibold"
              style={{ color: '#7A5A2E', letterSpacing: '0.07em' }}
            >
              البريد الإلكتروني
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              required
              autoComplete="email"
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              style={f('email')}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-semibold"
              style={{ color: '#7A5A2E', letterSpacing: '0.07em' }}
            >
              كلمة المرور
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              required
              autoComplete="current-password"
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              style={f('password')}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="text-xs text-right rounded-xl px-4 py-3"
              style={{
                color       : '#8A6425',
                background  : 'rgba(184, 134, 58, 0.08)',
                borderWidth : '1px',
                borderStyle : 'solid',
                borderColor : 'rgba(184, 134, 58, 0.22)',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="font-bold rounded-xl py-3.5 mt-2 cursor-pointer transition-all duration-300 disabled:opacity-60"
            style={{
              background : loading
                ? 'rgba(184, 134, 58, 0.12)'
                : 'linear-gradient(135deg, rgba(184, 134, 58, 0.85) 0%, rgba(122, 90, 46, 0.90) 100%)',
              color       : loading ? '#8A6425' : '#FFFFFF',
              borderWidth : '1px',
              borderStyle : 'solid',
              borderColor : loading ? 'rgba(184, 134, 58, 0.25)' : 'transparent',
              fontSize    : '0.9rem',
            }}
          >
            {loading ? 'جارٍ التحقق...' : '⚙ الدخول إلى غرفة القيادة'}
          </button>
        </form>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-xs transition-colors duration-200"
            style={{ color: '#5E6E67' }}
            onMouseEnter={e => e.currentTarget.style.color = '#4A5D56'}
            onMouseLeave={e => e.currentTarget.style.color = '#5E6E67'}
          >
            ← العودة إلى الموقع
          </Link>
        </div>
      </div>
    </div>
  )
}
