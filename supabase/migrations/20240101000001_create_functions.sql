-- Function to update user email without confirmation
create or replace function public.update_user_email(target_user_id uuid, new_email text)
returns void
language plpgsql
security definer
as $$
begin
  -- Check if the executing user is the target user or an admin
  if auth.uid() = target_user_id or 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  then
    -- Update auth.users email
    update auth.users 
    set email = new_email,
        email_confirmed_at = now()
    where id = target_user_id;
    
    -- Update profiles email
    update public.profiles 
    set email = new_email 
    where id = target_user_id;
  else
    raise exception 'Unauthorized';
  end if;
end;
$$;

-- Function to delete user and all associated data
create or replace function public.delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  storage_object record;
begin
  -- Check if the executing user is the target user or an admin
  if auth.uid() = target_user_id or 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  then
    -- Delete storage objects
    for storage_object in 
      select name 
      from storage.objects 
      where bucket_id = 'audio-files' 
      and storage.foldername(name)[1] = target_user_id::text
    loop
      delete from storage.objects 
      where name = storage_object.name;
    end loop;

    -- Delete transcriptions
    delete from public.transcriptions 
    where user_id = target_user_id;
    
    -- Delete profile
    delete from public.profiles 
    where id = target_user_id;
    
    -- Delete auth user
    delete from auth.users 
    where id = target_user_id;
  else
    raise exception 'Unauthorized';
  end if;
end;
$$;