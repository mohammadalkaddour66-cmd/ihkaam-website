import { Link } from 'react-router-dom'
import { Handshake, ArrowLeft } from 'lucide-react'
import { AFFILIATE_PCT } from '../../config/affiliate'

/* دعوة هادئة إلى برنامج الشراكة في نهاية «من نحن» و«تواصل بنا».
   ليست في البار العلوي عمداً: الزائر هناك مدير معهد يريد أن يشتري، والشريك المحتمل أقل عدداً. */
export default function AffiliateInvite({ tight = false }) {
  return (
    <div dir="rtl" className={`px-4 sm:px-6 pb-16 ${tight ? '-mt-12' : ''}`}>
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 rounded-2xl px-6 py-5 text-center sm:text-start"
        style={{ background: '#FDFBF7', boxShadow: 'var(--shadow-sm), inset 0 0 0 1px var(--line-warm)' }}>
        <span className="shrink-0 w-12 h-12 rounded-xl grid place-items-center" style={{ background: '#0B3B33' }}>
          <Handshake size={22} color="#E0B562" />
        </span>
        <p className="flex-1 text-[16px] leading-[1.9] text-[#1A2E28]">
          <span className="font-bold">تعرف معهداً يحتاج إحكام؟</span>{' '}
          اربح <span className="font-black" style={{ color: '#8A6425' }}>{AFFILIATE_PCT}%</span> من أول اشتراك سنوي يدفعه.
        </p>
        <Link to="/affiliate" className="shrink-0 inline-flex items-center gap-2 font-bold text-[15px]" style={{ color: '#1F6F52' }}>
          برنامج الشراكة <ArrowLeft size={15} />
        </Link>
      </div>
    </div>
  )
}
