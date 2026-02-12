
-- Drop stale RLS policies referencing removed enums/roles
DROP POLICY IF EXISTS "Accountants can view trips for approved vouchers" ON public.trips;
DROP POLICY IF EXISTS "Accountants can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- Drop the old programs table (replaced by clients/projects)
DROP TABLE IF EXISTS public.programs CASCADE;

-- Clean up the has_role function (already dropped with enum, but just in case)
DROP FUNCTION IF EXISTS public.has_role CASCADE;
