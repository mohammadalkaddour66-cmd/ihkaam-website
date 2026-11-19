-- تراجع 20260816_partners_paid_only.sql
-- يحذف المنظر ومنحته. بعده يعود الشريط إلى عرض الجميع (بما فيهم
-- التجريبيّون) فقط إن أُعيد IhkaamPartners.jsx إلى القراءة من
-- institute_settings مباشرةً؛ وإلّا فسيختفي الشريط (لا يجد المنظر).
BEGIN;
DROP VIEW IF EXISTS public.public_partners;
COMMIT;
