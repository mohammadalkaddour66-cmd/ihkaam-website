import { useState } from 'react'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'

/*
  هذا المكوّن مُجهَّز للإدراج المباشر في جداول Supabase المخصصة
  بدلاً من استخدام Supabase Auth.

  الجداول المستهدفة (ستُنشأ لاحقاً):
    - institutes (name, email, phone, plan, created_at)
    - institute_users (institute_id, name, email, password_hash, role)

  يُنشئ لاحقاً: supabase.from('institutes').insert({...})
*/

const defaultRegisterForm = {
  instituteName: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  plan: 'professional',
}

const defaultLoginForm = {
  email: '',
  password: '',
}

export default function AuthModal({ mode, onClose }) {
  const [activeMode, setActiveMode] = useState(mode)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registerForm, setRegisterForm] = useState(defaultRegisterForm)
  const [loginForm, setLoginForm] = useState(defaultLoginForm)
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // TODO: إدراج مباشر في جدول institutes ثم institute_users
      // const { data, error } = await supabase
      //   .from('institutes')
      //   .insert({ name: registerForm.instituteName, email: registerForm.email, ... })
      await new Promise((r) => setTimeout(r, 1200))
      alert('تم تسجيل المعهد بنجاح! سيتم تفعيل حسابك قريباً.')
      onClose()
    } catch {
      setError('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // TODO: التحقق من بيانات الدخول عبر جدول institute_users
      // const { data } = await supabase
      //   .from('institute_users')
      //   .select('*')
      //   .eq('email', loginForm.email)
      //   .single()
      await new Promise((r) => setTimeout(r, 1200))
      alert('مرحباً بك في نور!')
      onClose()
    } catch {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1C1917]/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-[#FAFAF7] rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 w-8 h-8 rounded-xl bg-[#F2EDE4] flex items-center justify-center text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
            <span className="text-white text-sm font-bold">ن</span>
          </div>
          <span className="text-xl font-bold text-[#1C1917]">نور</span>
        </div>

        {/* Tabs */}
        <div className="flex rounded-2xl bg-[#F2EDE4] p-1 mb-7">
          {['register', 'login'].map((m) => (
            <button
              key={m}
              onClick={() => { setActiveMode(m); setError('') }}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                activeMode === m
                  ? 'bg-white text-[#1C1917] shadow-sm'
                  : 'text-[#78716C] hover:text-[#44403C]'
              }`}
            >
              {m === 'register' ? 'حساب جديد' : 'تسجيل الدخول'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        {activeMode === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <Field
              label="اسم المعهد"
              type="text"
              placeholder="معهد النور القرآني"
              value={registerForm.instituteName}
              onChange={(v) => setRegisterForm({ ...registerForm, instituteName: v })}
            />
            <Field
              label="اسمك الكامل"
              type="text"
              placeholder="أحمد محمد العمري"
              value={registerForm.name}
              onChange={(v) => setRegisterForm({ ...registerForm, name: v })}
            />
            <Field
              label="البريد الإلكتروني"
              type="email"
              placeholder="info@institute.com"
              value={registerForm.email}
              onChange={(v) => setRegisterForm({ ...registerForm, email: v })}
            />
            <Field
              label="رقم الجوال"
              type="tel"
              placeholder="+966 50 000 0000"
              value={registerForm.phone}
              onChange={(v) => setRegisterForm({ ...registerForm, phone: v })}
            />
            <div className="relative">
              <Field
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                placeholder="٨ أحرف على الأقل"
                value={registerForm.password}
                onChange={(v) => setRegisterForm({ ...registerForm, password: v })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 bottom-3 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-gold text-white font-bold py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'إنشاء الحساب مجاناً'}
            </button>
            <p className="text-xs text-[#78716C] text-center">
              بالتسجيل توافق على{' '}
              <a href="#" className="text-[#B8860B] hover:underline">شروط الاستخدام</a>
              {' '}و{' '}
              <a href="#" className="text-[#B8860B] hover:underline">سياسة الخصوصية</a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <Field
              label="البريد الإلكتروني"
              type="email"
              placeholder="info@institute.com"
              value={loginForm.email}
              onChange={(v) => setLoginForm({ ...loginForm, email: v })}
            />
            <div className="relative">
              <Field
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(v) => setLoginForm({ ...loginForm, password: v })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 bottom-3 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="text-left">
              <a href="#" className="text-sm text-[#B8860B] hover:underline">نسيت كلمة المرور؟</a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-gold text-white font-bold py-3 rounded-2xl hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'تسجيل الدخول'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({ label, type, placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#44403C] mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full bg-white border border-[#E8E0D0] rounded-2xl px-4 py-3 text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/10 transition-all duration-200"
      />
    </div>
  )
}
