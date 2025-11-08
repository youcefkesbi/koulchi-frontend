CREATE OR REPLACE FUNCTION public.has_role(check_user uuid, check_role text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.user_roles
    where user_id = check_user and role = check_role
  );
$function$
