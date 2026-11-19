import { useState, useEffect } from 'react'
import { fetchPartnerRows, cleanPartners, titleOf } from '../../config/partners'
import InstituteMark from './InstituteMark'

/* الترشيح (تجريبيّ، مكرَّر) ومصدر الصفوف في config/partners.js، مشتركان مع
   قصص النجاح (ISS-40). الشعار أو الطُّغراء البديلة: InstituteMark. */

function PartnerCard({ partner }) {
  const name = titleOf(partner)
  return (
    <div className="ihk-medal">
      <div className="ihk-medal-disc">
        <InstituteMark name={name} logoUrl={partner.theme_config?.logo_url || ''} size={112} />
      </div>
      <span className="ihk-medal-name" dir="rtl">{name}</span>
    </div>
  )
}

export default function IhkaamPartners() {
  const [partners, setPartners] = useState([])

  useEffect(() => {
    /* المصدر (المنظر public_partners أو institute_settings) يقرّره
       config/partners.js — انظر رأسه. */
    let cancelled = false
    fetchPartnerRows().then((rows) => { if (!cancelled) setPartners(cleanPartners(rows)) })
    return () => { cancelled = true }
  }, [])

  if (!partners.length) return null


  return (
    <section className="relative z-10 py-20 overflow-hidden">
      <div className="text-center px-6 mb-12">
        <span className="eyebrow">شركاء النجاح</span>
        <h2 className="font-bold mt-5" style={{ color: 'var(--text-1)', fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)' }}>
          <span className="title-mark">{partners.length} معهداً</span> تدير حلقاتها بإحكام
        </h2>
      </div>

      <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-x-6 gap-y-10">
        {partners.map(p => <div key={p.institute_id} className="w-[44%] sm:w-[30%] lg:w-[18%] flex justify-center"><PartnerCard partner={p} /></div>)}
      </div>

      <style>{`
        /* direction:ltr على الحاوية لا على المسار وحده.

           المسار عرضه max-content (5505px) داخل حاوية 390px، والصفحة
           كلها RTL. وفي RTL يُسنَد الفائض إلى اليسار: يبدأ المسار عند
           390−5505 = −5115px قبل أن تعمل الحركة أصلاً. ثم تدفعه الحركة
           translateX(−33.3%) زيادةً 1835px لليسار، فيخرج آخر ما بقي من
           البطاقات عن الشاشة — فيظهر الشريط فارغاً تماماً.

           كان direction:ltr على المسار، وهو يضبط انسياب محتواه لا
           موضعه هو؛ فالموضع تحكمه الحاوية. وضْعه هنا يجعل المسار
           يبدأ من الحافة اليسرى (x=0) فتعمل الحركة كما صُمّمت.
           قياساً: البطاقات الظاهرة على الجوال 1 من 27 → 3، وعلى
           سطح المكتب 10 → 15. */
        .ihk-medal {
          display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center;
          transition: transform 350ms var(--ease-out);
        }
        .ihk-medal:hover { transform: translateY(-6px); }
        .ihk-medal-disc {
          width: 112px; height: 112px; border-radius: 999px; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          background: #FFFFFF;
          box-shadow: 0 0 0 1px rgba(184, 134, 58, 0.35), 0 0 0 7px #FBF7EC, 0 0 0 8px rgba(184, 134, 58, 0.25), 0 18px 34px -16px rgba(11, 59, 51, 0.35);
          transition: box-shadow 350ms var(--ease-out);
        }
        .ihk-medal:hover .ihk-medal-disc {
          box-shadow: 0 0 0 1.5px rgba(184, 134, 58, 0.7), 0 0 0 7px #FBF7EC, 0 0 0 8px rgba(184, 134, 58, 0.45), 0 24px 40px -16px rgba(11, 59, 51, 0.45);
        }
        .ihk-medal-disc img { width: 100%; height: 100%; object-fit: cover; }
        .ihk-medal-name {
          font-size: 0.95rem; font-weight: 700; line-height: 1.5;
          color: var(--text-1); max-width: 170px;
        }
      `}</style>
    </section>
  )
}
