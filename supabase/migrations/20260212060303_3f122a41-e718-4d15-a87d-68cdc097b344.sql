
-- Drop approval workflow tables
DROP TABLE IF EXISTS public.approval_history CASCADE;
DROP TABLE IF EXISTS public.mileage_vouchers CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop related enums
DROP TYPE IF EXISTS public.approval_action CASCADE;
DROP TYPE IF EXISTS public.voucher_status CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Drop the has_role function
DROP FUNCTION IF EXISTS public.has_role CASCADE;
