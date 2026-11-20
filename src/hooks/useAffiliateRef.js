import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/* رمز الإحالة: يُلتقط من ?ref= في أي صفحة ويُحفظ 30 يوماً، ثم يقرؤه
   نموذج الطلب عند الإرسال فيكتبه في tenant_requests.referral_code.

   الشكل المقبول IHK- ثم حروف لاتينية وأرقام وشرطات فقط: ما سواه يُهمل،
   فلا يدخل نصٌّ عشوائي من الرابط إلى قاعدة البيانات. */

const STORAGE_KEY = 'ihkaam_ref'
const TTL_MS      = 30 * 24 * 60 * 60 * 1000
const CODE_RE     = /^IHK-[A-Z0-9-]{3,24}$/

export const isValidRefCode = (code) => CODE_RE.test(String(code ?? '').trim().toUpperCase())

export function useAffiliateRef() {
  const { search } = useLocation()

  useEffect(() => {
    const ref = new URLSearchParams(search).get('ref')?.trim().toUpperCase()
    if (!ref || !CODE_RE.test(ref)) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ code: ref, capturedAt: Date.now() }))
    } catch { /* التخزين محجوب: يضيع الرمز بصمت ولا يتعطّل شيء */ }
  }, [search])
}

/* يُستدعى من نموذج الطلب: الرمز المحفوظ إن بقي صالحاً، وإلا null */
export function getStoredRef() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { code, capturedAt } = JSON.parse(raw)
    if (Date.now() - capturedAt > TTL_MS || !CODE_RE.test(code)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return code
  } catch {
    return null
  }
}
