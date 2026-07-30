-- ══════════════════════════════════════════════════════════════════
-- تراجع — إلغاء 20260727_lock_platform_settings_anon_write.sql
--
-- يُعيد platform_settings إلى حالته قبل الإقفال حرفياً: السياستان
-- المحذوفتان بنفس تعريفهما الأصلي، ومنحتا INSERT/UPDATE للزائر.
--
-- التعريف الأصلي مأخوذ من سجلّ التنفيذ الفعلي:
--   create policy "anon_upsert_settings" on platform_settings
--     for insert to anon with check (true)
--   create policy "anon_update_settings" on platform_settings
--     for update to anon using (true) with check (true)
--   grant select, insert, update on table platform_settings to anon
--
-- ⚠️ تحذير: تشغيله يُعيد فتح ثغرة الكتابة للزائر. لا تشغّله إلا إن
-- ظهر خلل فعلي بعد الإقفال — وسجّل ما الذي انكسر بالضبط قبل التراجع،
-- لأن ذلك يكشف كاتباً لم يُهاجَر بعد إلى Supabase Auth.
--
-- معاملة ذرّية: إن فشل شيء لا يُطبَّق شيء.
-- ══════════════════════════════════════════════════════════════════

BEGIN;

-- ── (1) إعادة منح الكتابة ─────────────────────────────────────────
GRANT INSERT, UPDATE ON TABLE public.platform_settings TO anon;

-- ── (2) إعادة السياستين بتعريفهما الأصلي ─────────────────────────
DROP POLICY IF EXISTS "anon_upsert_settings" ON public.platform_settings;
CREATE POLICY "anon_upsert_settings"
  ON public.platform_settings
  FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON public.platform_settings;
CREATE POLICY "anon_update_settings"
  ON public.platform_settings
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

COMMIT;
