/* ══════════════════════════════════════════════════════════════════
   عميل Supabase — واجهة خفيفة بنفس شكل supabase-js (ISS-27 / ISS-28)

   مكتبة supabase-js وحدها ~49KB مضغوطة (194KB خام)، وكانت تُحمَّل مع
   كل صفحة تسويقية لأن مكوّنات الرئيسية تستوردها. والصفحات التسويقية لا
   تحتاج منها إلا قراءاتٍ عامة بسيطة. فصار هذا الملف يصدّر `supabase`
   بنفس الواجهة التي تكتبها المكوّنات (from().select().eq()… و rpc()
   و auth و storage)، ويقرّر عند التنفيذ:

   • قراءة عامة من جدولٍ في PUBLIC_TABLES بمرشّحاتٍ بسيطة، أو دالة في
     PUBLIC_RPCS ← طلب fetch مباشر إلى PostgREST، بلا المكتبة.
     والطلبات المتطابقة في الجلسة الواحدة تُرسل مرة واحدة ويتشارك نتيجتها
     كل من طلبها (كان جدول institute_settings يُقرأ مرتين في الرئيسية).
   • كل ما عدا ذلك (إدراج، تحديث، حذف، تسجيل دخول، رفع ملفات، أي جدول
     آخر) ← تُحمَّل supabase-js عند أول حاجة (import ديناميكي) ويُعاد
     تنفيذ السلسلة نفسها عليها حرفياً. لوحة الإدارة والنماذج تعمل كما كانت.

   لا مفتاح خاص هنا: المفتاح العام (anon) نفسه الذي كانت تحمله المكتبة،
   والقراءات العامة تخضع لسياسات RLS نفسها.
   ══════════════════════════════════════════════════════════════════ */

const rawUrl          = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!rawUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  )
}

// Strip any accidental trailing path (e.g. /rest/v1/) — client appends its own paths
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')

/* ── العميل الكامل: يُحمَّل عند أول عملية لا تغطيها القراءة المباشرة ── */
let realClient = null
export function getSupabase() {
  if (!realClient) {
    realClient = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession  : true,
          autoRefreshToken: true,
          storageKey      : 'mq-admin-session',
        },
      }),
    )
    realClient.catch(() => { realClient = null })
  }
  return realClient
}

/* الجداول والدوال التي يقرؤها الزائر المجهول. قراءتها بالمفتاح العام
   تعيد ما تعيده المكتبة تماماً، لأن الزائر لا جلسة له. جداول الإدارة
   ليست هنا عمداً: قراءتها تحتاج جلسة المدير، فتمرّ عبر المكتبة. */
const PUBLIC_TABLES = new Set([
  'gallery_items',
  'institute_settings',
  'public_partners',
  'testimonials',
  'system_settings',
  'store_features',
])
const PUBLIC_RPCS = new Set([
  'get_public_landing_stats',
  'get_institute_locations',
  'get_success_story_metrics',
])
const FILTERS = new Set(['eq', 'neq', 'in', 'is', 'order', 'limit'])

const REST = `${supabaseUrl}/rest/v1`
/* Accept-Profile إلزامي هنا: أول مخطط معروض في إعداد المشروع ليس public،
   فبدونه يبحث PostgREST في مخططٍ آخر ويعيد 404. */
const HEADERS = { apikey: supabaseAnonKey, 'Accept-Profile': 'public' }

/* طلبٌ واحد لكل رابط في عمر الصفحة. يُخزَّن النص لا الكائن، فيأخذ كل
   مستدعٍ نسخته الخاصة ولا يعدّل أحدٌ مصفوفة غيره. الفشل لا يُخزَّن. */
const inflight = new Map()

function request(key, url, init) {
  let p = inflight.get(key)
  if (!p) {
    p = fetch(url, init).then(async (res) => ({ ok: res.ok, status: res.status, statusText: res.statusText, text: await res.text() }))
    inflight.set(key, p)
    p.then((r) => { if (!r.ok) inflight.delete(key) }, () => inflight.delete(key))
  }
  return p.then(
    ({ ok, status, statusText, text }) => {
      let body
      try { body = text ? JSON.parse(text) : null } catch { body = { message: text } }
      return ok
        ? { data: body, error: null, count: null, status, statusText }
        : { data: null, error: body || { message: statusText }, count: null, status, statusText }
    },
    (err) => ({ data: null, error: { message: String(err?.message || err) }, count: null, status: 0, statusText: '' }),
  )
}

/* نفس ترميز postgrest-js للقيم داخل in.(…) */
const listValue = (v) => (typeof v === 'string' && /[,()]/.test(v) ? `"${v}"` : `${v}`)
/* نفس تنظيف postgrest-js لقائمة الأعمدة: تُحذف المسافات خارج علامات التنصيص */
function cleanColumns(cols) {
  let quoted = false
  return cols.split('').map((c) => {
    if (/\s/.test(c) && !quoted) return ''
    if (c === '"') quoted = !quoted
    return c
  }).join('')
}

/* سلسلة from(table).select(cols).eq()… إلى رابط REST، أو null إن لم
   تكن قراءة بسيطة (فتذهب إلى المكتبة). */
function directSelect(table, calls) {
  if (!PUBLIC_TABLES.has(table) || !calls.length) return null
  const [first, ...rest] = calls
  if (first.k !== 'select' || first.a.length > 1 || (first.a[0] != null && typeof first.a[0] !== 'string')) return null

  const params = new URLSearchParams()
  params.set('select', cleanColumns(first.a[0] ?? '*'))
  const orders = []
  for (const { k, a } of rest) {
    if (!FILTERS.has(k)) return null
    const [col, val] = a
    if (k === 'eq' || k === 'neq' || k === 'is') params.append(col, `${k}.${val}`)
    else if (k === 'in') {
      if (!Array.isArray(val)) return null
      params.append(col, `in.(${val.map(listValue).join(',')})`)
    } else if (k === 'order') {
      const o = val || {}
      if (o.foreignTable || o.referencedTable) return null
      const asc = o.ascending ?? true
      const nulls = o.nullsFirst === undefined ? '' : o.nullsFirst ? '.nullsfirst' : '.nullslast'
      orders.push(`${col}.${asc ? 'asc' : 'desc'}${nulls}`)
    } else if (k === 'limit') {
      if (val && (val.foreignTable || val.referencedTable)) return null
      params.set('limit', String(col))
    }
  }
  if (orders.length) params.set('order', orders.join(','))
  const url = `${REST}/${table}?${params}`
  return request(url, url, { headers: HEADERS })
}

function directRpc(fn, args, opts, more) {
  if (!PUBLIC_RPCS.has(fn) || more.length || (opts && Object.keys(opts).length)) return null
  const body = JSON.stringify(args ?? {})
  const url  = `${REST}/rpc/${fn}`
  return request(`${url} ${body}`, url, {
    method : 'POST',
    headers: { ...HEADERS, 'Content-Profile': 'public', 'Content-Type': 'application/json' },
    body,
  })
}

/* إعادة تنفيذ السلسلة المسجّلة على العميل الكامل، مع ربط this بصاحب الدالة. */
function replay(client, steps) {
  let cur = client
  let owner
  for (const s of steps) {
    if (s.t === 'get') { owner = cur; cur = cur[s.k] }
    else { cur = cur.apply(owner, s.a); owner = undefined }
  }
  return cur
}

/* السلسلة كاملة بصيغة مسطّحة: [{k:'from', a:['x']}, {k:'select', a:[…]}…] */
function flatten(steps) {
  const out = []
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].t === 'get' && steps[i + 1]?.t === 'call') { out.push({ k: steps[i].k, a: steps[i + 1].a }); i++ }
    else return null
  }
  return out
}

function execute(steps) {
  const flat = flatten(steps)
  if (flat) {
    const [head, ...more] = flat
    const direct =
      head.k === 'from' ? directSelect(head.a[0], more)
      : head.k === 'rpc' ? directRpc(head.a[0], head.a[1], head.a[2], more)
      : null
    if (direct) return direct
  }
  return getSupabase().then((client) => replay(client, steps))
}

/* دالتان متزامنتان في supabase-js لا يصلح لهما التأجيل:
   onAuthStateChange تعيد الاشتراك فوراً، و getPublicUrl تعيد الرابط فوراً. */
function syncCall(steps, args) {
  const path = steps.filter((s) => s.t === 'get').map((s) => s.k).join('.')

  if (path === 'auth.onAuthStateChange' && steps.length === 2) {
    let sub = null
    let cancelled = false
    getSupabase().then((c) => {
      if (!cancelled) sub = c.auth.onAuthStateChange(...args).data.subscription
    })
    return { data: { subscription: { unsubscribe() { cancelled = true; sub?.unsubscribe() } } } }
  }

  if (path === 'storage.from.getPublicUrl' && steps.length === 4) {
    const bucket = steps[2].a[0]
    const [file, opts] = args
    const finalPath = `${bucket}/${String(file).replace(/^\/+/, '')}`
    const t = opts?.transform
    const q = new URLSearchParams()
    if (t) for (const k of ['width', 'height', 'resize', 'format', 'quality']) if (t[k] != null) q.set(k, t[k])
    if (opts?.download) q.set('download', opts.download === true ? '' : opts.download)
    const qs = q.toString()
    const kind = t ? 'render/image' : 'object'
    return { data: { publicUrl: encodeURI(`${supabaseUrl}/storage/v1/${kind}/public/${finalPath}${qs ? `?${qs}` : ''}`) } }
  }

  return undefined
}

function lazyChain(steps) {
  const fn = function () {}
  return new Proxy(fn, {
    get(_, prop) {
      if (typeof prop === 'symbol') return undefined
      /* تُصبح السلسلة «وعداً» بعد أول استدعاء فقط، فلا يُعامَل `supabase`
         نفسه ولا `supabase.auth` كوعد. */
      const callable = steps.length && steps[steps.length - 1].t === 'call'
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        if (!callable) return undefined
        return (...a) => {
          const p = execute(steps)
          return p[prop](...a)
        }
      }
      return lazyChain([...steps, { t: 'get', k: prop }])
    },
    apply(_, __, args) {
      const sync = syncCall(steps, args)
      if (sync !== undefined) return sync
      return lazyChain([...steps, { t: 'call', a: args }])
    },
  })
}

export const supabase = lazyChain([])
