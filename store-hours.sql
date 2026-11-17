-- شغّل الملف ده مرة واحدة في Supabase > SQL Editor
-- بيضيف مواعيد فتح وغلق المتجر ومفتاح إغلاق يدوي
alter table public.store_settings
  add column if not exists open_from time,
  add column if not exists open_to time,
  add column if not exists force_closed boolean not null default false,
  add column if not exists closed_message text;
