CREATE OR REPLACE FUNCTION public.has_any_role(check_user uuid, check_roles text[])
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.user_roles
    where user_id = check_user and role = any(check_roles)
  );
$function$
