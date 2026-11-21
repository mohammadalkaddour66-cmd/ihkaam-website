-- ══════════════════════════════════════════════════════════════════
-- شرط الترقية (قرار المالك 2026-11-20): نافذة 90 يوماً من أول اشتراك للمعهد.
--
-- • العمولة 20% على أول دفعة سنوية للمعهد، حتى لو بدأ شهرياً ثم رُقّي إلى السنوي
--   خلال 90 يوماً من أول اشتراك معتمد له (أقدم طلب معتمد = approved_at).
-- • الشريك يُحدَّد من سجل المعهد نفسه: رمز أقدم طلب معتمد يحمل رمزاً. فلو سُجّلت
--   الترقية من لوحة الأدمن بلا رمز، تبقى العمولة للشريك الأصلي.
-- • أول طلب للمعهد إن كان سنوياً يُحتسب دائماً (لا نافذة عليه).
-- • حالة جديدة: outside_window = أول دفعة سنوية جاءت بعد النافذة: لا عمولة.
-- • حقل جديد في كل إحالة: upgrade_by = آخر موعد للترقية (على أول طلب شهري فقط).
--
-- يطابق src/utils/affiliateRules.ts في تطبيق إحكام. أي تعديل هنا يلزمه تعديل هناك.
-- CREATE OR REPLACE يُبقي الصلاحيات (anon يملك EXECUTE).
-- ══════════════════════════════════════════════════════════════════

create or replace function public.get_affiliate_stats(p_code text)
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  c_window     constant int := 90;
  v_aff        affiliate_applications%rowtype;
  v_first_rate numeric;
  v_earned     numeric;
  v_paid_out   numeric;
  v_refs       json;
  v_counted    bigint;
  v_total      bigint;
  v_active     bigint;
  v_pending    bigint;
  v_code       text := upper(trim(p_code));
begin
  select * into v_aff
  from affiliate_applications
  where upper(referral_code) = v_code
  limit 1;

  if v_aff.id is null then
    return json_build_object('affiliate', null);
  end if;

  select coalesce(value::numeric, 20) into v_first_rate
  from platform_settings where key = 'commission_first_rate' limit 1;
  v_first_rate := coalesce(v_first_rate, 20);

  with base as (
    select r.*, coalesce(r.provisioned_institute_id, r.id::text) as k
    from tenant_requests r
  ),
  attr as (
    -- الشريك صاحب المعهد: رمز أقدم طلب معتمد يحمل رمزاً
    select distinct on (k) k, upper(btrim(referral_code)) as code
    from base
    where status = 'approved' and btrim(coalesce(referral_code, '')) <> ''
    order by k, created_at, id
  ),
  first_req as (
    -- أول اشتراك للمعهد: أقدم طلب معتمد
    select distinct on (k) k, id as first_id, coalesce(approved_at, created_at) as t0
    from base
    where status = 'approved'
    order by k, coalesce(approved_at, created_at), created_at, id
  ),
  first_paid as (
    -- أقدم طلب سنوي مدفوع لكل معهد، بغضّ النظر عن رمز الإحالة
    select distinct on (k) k, id
    from base
    where status = 'approved' and is_annual_cycle(billing_cycle) and paid_at is not null
    order by k, paid_at, created_at, id
  ),
  refs as (
    select b.*,
           coalesce(b.commission_rate, v_first_rate) as eff_rate,
           fr.first_id, fr.t0, fp.id as fp_id,
           case
             when b.status = 'rejected'                      then 'rejected'
             when b.status <> 'approved'                     then 'pending'
             when not is_annual_cycle(b.billing_cycle)       then 'not_annual'
             when b.paid_at is null                          then 'awaiting_payment'
             when fp.id is distinct from b.id                then 'repeat'
             when b.id <> fr.first_id
              and b.paid_at > fr.t0 + make_interval(days => c_window) then 'outside_window'
             else 'counted'
           end as state
    from base b
    left join attr a        on a.k  = b.k
    left join first_req fr  on fr.k = b.k
    left join first_paid fp on fp.k = b.k
    where coalesce(a.code, upper(btrim(coalesce(b.referral_code, '')))) = v_code
  ),
  priced as (
    select refs.*,
           case when state = 'counted'
                then round(coalesce(paid_amount, total_amount, 0) * eff_rate / 100.0, 2)
           end as commission,
           case when state = 'not_annual' and id = first_id and fp_id is null
                     and now() <= t0 + make_interval(days => c_window)
                then t0 + make_interval(days => c_window)
           end as upgrade_by
    from refs
  )
  select coalesce(sum(commission), 0),
         count(*) filter (where state = 'counted'),
         count(*),
         count(*) filter (where status = 'approved'),
         count(*) filter (where status = 'pending'),
         coalesce(json_agg(
           json_build_object(
             'id',               id,
             'name',             coalesce(institute_name, '—'),
             'tier',             subscription_tier,
             'billing_cycle',    billing_cycle,
             'order_amount',     total_amount,
             'paid_at',          paid_at,
             'paid_amount',      paid_amount,
             'commission_rate',  eff_rate,
             'commission',       commission,
             'commission_state', state,
             'upgrade_by',       upgrade_by,
             'date',             created_at,
             'status',           status
           ) order by created_at desc
         ), '[]'::json)
  into v_earned, v_counted, v_total, v_active, v_pending, v_refs
  from priced;

  select coalesce(round(sum(amount)::numeric, 2), 0)
  into v_paid_out
  from affiliate_payouts
  where upper(referral_code) = v_code;

  return json_build_object(
    'affiliate',      json_build_object(
                        'id',        v_aff.id,
                        'name',      v_aff.full_name,
                        'joined_at', v_aff.created_at,
                        'status',    v_aff.status
                      ),
    'total',          v_total,
    'active',         v_active,
    'counted',        v_counted,
    'pending',        v_pending,
    'earned',         v_earned,
    'paid_out',       v_paid_out,
    'pending_payout', round((v_earned - v_paid_out)::numeric, 2),
    'first_rate',     v_first_rate,
    'window_days',    c_window,
    'referrals',      v_refs
  );
end;
$function$;
