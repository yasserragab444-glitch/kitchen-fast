-- شغّل الملف ده مرة واحدة في Supabase > SQL Editor
-- بيضيف خانة "تكلفة الكيلو" لكل منتج علشان تظهر الأرباح في لوحة الإدارة
alter table public.products add column if not exists cost_per_kg numeric not null default 0;
