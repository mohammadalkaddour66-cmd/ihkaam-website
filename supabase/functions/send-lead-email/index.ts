/**
 * Supabase Edge Function: send-lead-email
 *
 * Triggered by Database Webhook on INSERT into lead_magnet_subscribers.
 * Sends a welcome email via Resend API.
 *
 * Setup (Supabase Dashboard):
 *   1. Deploy: supabase functions deploy send-lead-email
 *   2. Set secret: supabase secrets set RESEND_API_KEY=re_xxxxxxxx
 *   3. Database → Webhooks → New Webhook:
 *        Table: lead_magnet_subscribers
 *        Event: INSERT
 *        URL: https://<project-ref>.supabase.co/functions/v1/send-lead-email
 *        HTTP Headers: Authorization: Bearer <service-role-key>
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL     = 'إحكام <noreply@ihkaam.com>'  // ← غيّر لدومينك المحقق

/* ── Email templates per variant ── */
type Variant = 'pdf' | 'insights' | 'blog' | 'ihkaam'

interface EmailTemplate {
  subject: string
  html: string
}

function buildEmail(email: string, variant: Variant, sourcePage: string): EmailTemplate {
  const baseUrl = 'https://ihkaam.com'  // ← غيّر لدومينك الفعلي

  const ctaButton = (href: string, label: string) =>
    `<a href="${href}" style="display:inline-block;background:#027368;color:#E5D3B3;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;margin:24px 0;">${label}</a>`

  const footer = `
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:40px 0 24px;" />
    <p style="color:#4A7060;font-size:12px;line-height:1.8;text-align:center;">
      تلقيت هذه الرسالة لأنك سجلت بريدك في موقع إحكام.<br>
      لإلغاء الاشتراك <a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#6ABDB2;">اضغط هنا</a>.
    </p>
  `

  const wrapper = (content: string) => `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#010D0D;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
        <!-- Header -->
        <div style="text-align:center;margin-bottom:40px;">
          <p style="color:#00A896;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;margin:0 0 8px;">
            نظام إحكام السحابي
          </p>
          <h1 style="color:#EAE4DF;font-size:26px;font-weight:900;margin:0;line-height:1.3;">إحكام</h1>
        </div>
        <!-- Content -->
        <div style="background:#011E1E;border:1px solid rgba(229,211,179,0.08);border-radius:20px;padding:40px 36px;">
          ${content}
        </div>
        ${footer}
      </div>
    </body>
    </html>
  `

  if (variant === 'pdf') {
    return {
      subject: 'دليل الأتمتة الذكية — جاهز للتحميل',
      html: wrapper(`
        <h2 style="color:#EAE4DF;font-size:22px;font-weight:900;margin:0 0 16px;line-height:1.4;">
          أهلاً! دليلك جاهز للتحميل.
        </h2>
        <p style="color:#7A9E96;font-size:15px;line-height:2;margin:0 0 8px;">
          شكراً لتسجيلك. دليل "الأتمتة الذكية" يغطي:
        </p>
        <ul style="color:#C8B8B0;font-size:14px;line-height:2.2;padding-right:20px;">
          <li>كيف تختار نظام إدارة مناسباً لحجم مركزك</li>
          <li>الأتمتة الـ 5 التي توفر أكثر وقتاً لمديري الحلقات</li>
          <li>مقارنة حقيقية بين الأدوات المتاحة في السوق</li>
          <li>خطة تنفيذ خطوة بخطوة</li>
        </ul>
        <div style="text-align:center;">
          ${ctaButton(`${baseUrl}/ihkaam`, '← تحميل الدليل الآن')}
        </div>
        <p style="color:#4A7060;font-size:13px;line-height:1.9;margin:0;">
          خلال الأيام القادمة سنرسل لك دراسة حالة حقيقية لمركز قرآني حوّل عملياته رقمياً — وكيف وفّر أكثر من 80 ساعة عمل شهرياً.
        </p>
      `),
    }
  }

  if (variant === 'insights') {
    return {
      subject: 'تقرير معايير شبكة إحكام — خاص بك',
      html: wrapper(`
        <h2 style="color:#EAE4DF;font-size:22px;font-weight:900;margin:0 0 16px;line-height:1.4;">
          إليك معايير شبكة إحكام الكاملة.
        </h2>
        <p style="color:#7A9E96;font-size:15px;line-height:2;margin:0 0 24px;">
          بناءً على بيانات +96 مركز في الشبكة، هذه هي المؤشرات المرجعية التي يجب أن تقارن مركزك بها:
        </p>
        <div style="background:rgba(2,115,104,0.08);border:1px solid rgba(2,115,104,0.20);border-radius:14px;padding:24px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="color:#6ABDB2;font-size:13px;font-weight:700;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">المؤشر</td>
              <td style="color:#6ABDB2;font-size:13px;font-weight:700;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);text-align:center;">متوسط الشبكة</td>
            </tr>
            <tr>
              <td style="color:#C8B8B0;font-size:13px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">طلاب / مركز</td>
              <td style="color:#EAE4DF;font-size:15px;font-weight:900;text-align:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">~45</td>
            </tr>
            <tr>
              <td style="color:#C8B8B0;font-size:13px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">حلقات / مركز</td>
              <td style="color:#EAE4DF;font-size:15px;font-weight:900;text-align:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">~8</td>
            </tr>
            <tr>
              <td style="color:#C8B8B0;font-size:13px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">طالب / معلم</td>
              <td style="color:#EAE4DF;font-size:15px;font-weight:900;text-align:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">~18</td>
            </tr>
            <tr>
              <td style="color:#C8B8B0;font-size:13px;padding:10px 0;">جلسات تسميع / طالب</td>
              <td style="color:#EAE4DF;font-size:15px;font-weight:900;text-align:center;padding:10px 0;">~12</td>
            </tr>
          </table>
        </div>
        <p style="color:#4A7060;font-size:13px;line-height:1.9;margin:0 0 24px;">
          هذه الأرقام تتحدث تلقائياً — للحصول على مقارنة مركزك بشكل لحظي ودقيق، انضم إلى شبكة إحكام وشاهد أين تقف فعلاً.
        </p>
        <div style="text-align:center;">
          ${ctaButton(`${baseUrl}/ihkaam#pricing`, 'انضم للشبكة ←')}
        </div>
      `),
    }
  }

  if (variant === 'blog') {
    return {
      subject: 'مرحباً في نشرة إحكام الأسبوعية',
      html: wrapper(`
        <h2 style="color:#EAE4DF;font-size:22px;font-weight:900;margin:0 0 16px;line-height:1.4;">
          يسعدنا انضمامك!
        </h2>
        <p style="color:#7A9E96;font-size:15px;line-height:2;margin:0 0 24px;">
          ستصلك كل ثلاثاء مقالة عملية عن إدارة مراكز التحفيظ — لا محتوى مبيعات، فقط خبرة تطبيقية حقيقية.
        </p>
        <p style="color:#C8B8B0;font-size:14px;line-height:2;margin:0 0 8px;font-weight:700;">في الأثناء، هذه أكثر مقالاتنا قراءةً:</p>
        <ul style="color:#7A9E96;font-size:13px;line-height:2.5;padding-right:20px;margin:0 0 24px;">
          <li><a href="${baseUrl}/blog/why-students-leave" style="color:#6ABDB2;text-decoration:none;">لماذا يترك الطلاب حلقتك؟</a></li>
          <li><a href="${baseUrl}/blog" style="color:#6ABDB2;text-decoration:none;">تصفح جميع المقالات →</a></li>
        </ul>
        <div style="text-align:center;">
          ${ctaButton(`${baseUrl}/blog`, 'اقرأ المقالات ←')}
        </div>
      `),
    }
  }

  /* ihkaam variant */
  return {
    subject: 'شكراً لاهتمامك — إليك ما يجب أن تعرفه عن إحكام',
    html: wrapper(`
      <h2 style="color:#EAE4DF;font-size:22px;font-weight:900;margin:0 0 16px;line-height:1.4;">
        لا عجلة — نحن هنا حين تكون مستعداً.
      </h2>
      <p style="color:#7A9E96;font-size:15px;line-height:2;margin:0 0 24px;">
        أفهم أن قرار تغيير نظام المركز يحتاج وقتاً. لذلك أريد أن أعطيك شيئاً مفيداً الآن دون أي التزام.
      </p>
      <div style="background:rgba(2,115,104,0.07);border:1px solid rgba(2,115,104,0.18);border-radius:14px;padding:24px;margin-bottom:24px;">
        <p style="color:#C8B8B0;font-size:14px;font-weight:700;margin:0 0 12px;">في 3 دقائق ستعرف:</p>
        <ul style="color:#7A9E96;font-size:13px;line-height:2.2;padding-right:20px;margin:0;">
          <li>كم ساعة يوفر إحكام أسبوعياً لمركز بحجم مركزك</li>
          <li>كيف يعمل الدعم الفني وما توقعات الإعداد الأول</li>
          <li>تجربة حية لمركز أشبه بمركزك بعد 3 أشهر من الاستخدام</li>
        </ul>
      </div>
      <div style="text-align:center;">
        ${ctaButton(`${baseUrl}/ihkaam`, 'شاهد النظام ←')}
      </div>
      <p style="color:#4A7060;font-size:13px;line-height:1.9;margin:24px 0 0;text-align:center;">
        أو راسلنا مباشرة وسنجيب على أي سؤال.
      </p>
    `),
  }
}

/* ── Follow-up email templates (day 3, 7, 14) ── */
function buildFollowUp(email: string, step: 2 | 3 | 4, variant: Variant): EmailTemplate {
  const baseUrl = 'https://ihkaam.com'
  const ctaButton = (href: string, label: string) =>
    `<a href="${href}" style="display:inline-block;background:#027368;color:#E5D3B3;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;margin:24px 0;">${label}</a>`

  const footer = `
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:40px 0 24px;" />
    <p style="color:#4A7060;font-size:12px;line-height:1.8;text-align:center;">
      لإلغاء الاشتراك <a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#6ABDB2;">اضغط هنا</a>.
    </p>
  `
  const wrapper = (content: string) => `
    <!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#010D0D;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
        <div style="text-align:center;margin-bottom:32px;">
          <p style="color:#00A896;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;margin:0 0 6px;">نظام إحكام السحابي</p>
          <h1 style="color:#EAE4DF;font-size:24px;font-weight:900;margin:0;">إحكام</h1>
        </div>
        <div style="background:#011E1E;border:1px solid rgba(229,211,179,0.08);border-radius:20px;padding:36px;">
          ${content}
        </div>
        ${footer}
      </div>
    </body></html>
  `

  if (step === 2) {
    return {
      subject: 'مركز مثل مركزك وفّر 41 ساعة شهرياً — إليك كيف',
      html: wrapper(`
        <h2 style="color:#EAE4DF;font-size:20px;font-weight:900;margin:0 0 14px;">قصة حقيقية من الرياض</h2>
        <p style="color:#7A9E96;font-size:14px;line-height:2;margin:0 0 18px;">
          مجمع حلقات بـ 3 فروع و240 طالباً كان يعاني من مشكلة واحدة:
          كل فرع يعمل بطريقة مختلفة — ورق، إكسل، وواتساب — ولا طريقة لمقارنة الأداء بينها.
        </p>
        <div style="background:rgba(2,115,104,0.08);border-right:3px solid #027368;border-radius:8px;padding:18px 20px;margin:0 0 20px;">
          <p style="color:#C8B8B0;font-size:14px;line-height:1.9;margin:0;">
            بعد 3 أشهر مع إحكام: <strong style="color:#6ABDB2;">41 ساعة</strong> موفرة شهرياً،
            لوحة تحكم واحدة للفروع الثلاثة، وخططوا لفتح فرع رابع.
          </p>
        </div>
        <p style="color:#7A9E96;font-size:13px;line-height:1.9;margin:0 0 20px;">
          مركزك أيضاً يمكنه تحقيق نفس النتيجة — استخدم حاسبة الوقت لترى كم ساعة يمكنك توفيرها:
        </p>
        <div style="text-align:center;">
          ${ctaButton(`${baseUrl}/ihkaam#roi`, 'احسب وقتك الآن ←')}
        </div>
      `),
    }
  }

  if (step === 3) {
    return {
      subject: 'شبكة +96 مركز تقول هذا عن المعدل الطبيعي',
      html: wrapper(`
        <h2 style="color:#EAE4DF;font-size:20px;font-weight:900;margin:0 0 14px;">هل مركزك فوق المعدل أم دونه؟</h2>
        <p style="color:#7A9E96;font-size:14px;line-height:2;margin:0 0 20px;">
          شبكة إحكام تضم الآن أكثر من 96 مركزاً — وهذه هي المعايير التي تحسبها تلقائياً من بياناتهم الحية:
        </p>
        <div style="background:#011E1E;border:1px solid rgba(2,115,104,0.20);border-radius:12px;overflow:hidden;margin:0 0 20px;">
          ${[
            ['متوسط الطلاب/مركز', '~45 طالب'],
            ['متوسط الطلاب/معلم', '~18 طالب'],
            ['جلسات التسميع/طالب/شهر', '~12 جلسة'],
            ['نسبة إكمال الخطة السنوية', '87%'],
          ].map(([l, v], i) => `
            <div style="display:flex;justify-content:space-between;padding:12px 18px;background:${i%2===0?'rgba(255,255,255,0.02)':'transparent'};border-top:${i>0?'1px solid rgba(255,255,255,0.04)':'none'};">
              <span style="color:#7A9E96;font-size:13px;">${l}</span>
              <span style="color:#6ABDB2;font-weight:700;font-size:14px;">${v}</span>
            </div>
          `).join('')}
        </div>
        <p style="color:#4A7060;font-size:13px;line-height:1.9;margin:0 0 16px;">
          هذه الأرقام تتحدث لحظياً — لرؤية مقارنة مركزك الكاملة انضم للشبكة.
        </p>
        <div style="text-align:center;">
          ${ctaButton(`${baseUrl}/insights`, 'شاهد مرصد الشبكة ←')}
        </div>
      `),
    }
  }

  /* step === 4 */
  return {
    subject: 'آخر رسالة — ثم نتركك وشأنك تماماً',
    html: wrapper(`
      <h2 style="color:#EAE4DF;font-size:20px;font-weight:900;margin:0 0 14px;">لا عروض، لا ضغط — فقط سؤال واحد</h2>
      <p style="color:#7A9E96;font-size:14px;line-height:2;margin:0 0 16px;">
        أرسلنا لك في الأسبوعين الماضيين: دليل الأتمتة، قصة نجاح حقيقية، ومعايير الشبكة.
      </p>
      <p style="color:#C8B8B0;font-size:14px;line-height:2;margin:0 0 20px;">
        السؤال الوحيد: <strong>ما الذي يمنعك من البدء؟</strong>
      </p>
      <div style="background:rgba(217,172,163,0.06);border:1px solid rgba(217,172,163,0.18);border-radius:12px;padding:20px;margin:0 0 20px;">
        <p style="color:#D9ACA3;font-size:13px;font-weight:700;margin:0 0 10px;">أكثر ما يسمعه الفريق:</p>
        <ul style="color:#7A9E96;font-size:13px;line-height:2.2;padding-right:18px;margin:0;">
          <li>التوقيت ليس مناسباً الآن → <span style="color:#C8B8B0;">الإعداد يستغرق أسبوعاً واحداً فقط</span></li>
          <li>التكلفة عالية → <span style="color:#C8B8B0;">ابدأ بأصغر باقة وتوسع لاحقاً</span></li>
          <li>لا أعرف إن كان يناسب مركزي → <span style="color:#C8B8B0;">جرّب النسخة التجريبية مجاناً</span></li>
        </ul>
      </div>
      <div style="text-align:center;">
        ${ctaButton(`${baseUrl}/ihkaam`, 'جرّب إحكام مجاناً ←')}
      </div>
      <p style="color:#3D5050;font-size:12px;text-align:center;margin:20px 0 0;">
        هذه آخر رسالة في هذه السلسلة — لن نرسل لك مجدداً إلا إذا طلبت ذلك.
      </p>
    `),
  }
}

/* ── Send one email via Resend ── */
async function sendEmail(to: string, subject: string, html: string, scheduledAt?: string) {
  const body: Record<string, unknown> = { from: FROM_EMAIL, to: [to], subject, html }
  if (scheduledAt) body.scheduled_at = scheduledAt

  const res  = await fetch('https://api.resend.com/emails', {
    method : 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body   : JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(data))
  return data.id as string
}

/* ── ISO timestamp N days from now ── */
function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

/* ── Main handler ── */
serve(async (req) => {
  try {
    const payload = await req.json()
    const record  = payload?.record ?? payload
    const { email, variant = 'pdf', source_page = '/' } = record

    if (!email) {
      return new Response(JSON.stringify({ error: 'no email in payload' }), { status: 400 })
    }

    const v = variant as Variant
    const results: string[] = []

    /* Email 1 — immediate welcome / content delivery */
    const e1 = buildEmail(email, v, source_page)
    results.push(await sendEmail(email, e1.subject, e1.html))

    /* Email 2 — day 3: case study */
    const e2 = buildFollowUp(email, 2, v)
    results.push(await sendEmail(email, e2.subject, e2.html, daysFromNow(3)))

    /* Email 3 — day 7: network data */
    const e3 = buildFollowUp(email, 3, v)
    results.push(await sendEmail(email, e3.subject, e3.html, daysFromNow(7)))

    /* Email 4 — day 14: final CTA */
    const e4 = buildFollowUp(email, 4, v)
    results.push(await sendEmail(email, e4.subject, e4.html, daysFromNow(14)))

    console.log(`[send-lead-email] Scheduled 4-email sequence for ${email} (variant: ${v}). IDs:`, results)
    return new Response(JSON.stringify({ ok: true, ids: results }), { status: 200 })
  } catch (err) {
    console.error('[send-lead-email] Error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
