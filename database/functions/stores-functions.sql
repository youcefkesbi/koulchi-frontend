-- Create an RPC function to get the authenticated user's store status
create or replace function public.get_user_store_status(auth_uid uuid)
returns table(
    store_id uuid,
    status store_status,
    can_create boolean
) as $$
begin
    return query
    select
        s.id,
        s.status,
        case 
            when s.id is null then true  -- no store exists
            when s.status = 'rejected' then true -- store rejected
            else false
        end as can_create
    from public.stores s
    where s.owner_id = auth_uid;
end;
$$ language plpgsql security definer;
