-- =====================================================================
-- CodeQuizz-AI · Esquema de Supabase (Postgres + Auth + RLS)
-- ---------------------------------------------------------------------
-- Ejecuta este archivo completo en Supabase → SQL Editor.
-- Es idempotente: puedes volver a ejecutarlo sin borrar datos.
--
-- Modelo:
--   profiles           → datos públicos de cada cuenta y su rol
--   student_progress   → progreso completo del estudiante en JSONB
--   classrooms         → clases creadas por docentes
--   classroom_members  → estudiantes inscritos en cada clase
--
-- Seguridad:
--   - Un estudiante solo ve/edita su propio progreso.
--   - Un docente solo ve estudiantes de SUS clases.
--   - El rol nunca se acepta desde el cliente: se promueve por SQL.
-- =====================================================================

create extension if not exists pgcrypto;

-- ───────────────────────────── Tablas ─────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'student' check (role in ('student', 'teacher')),
  created_at timestamptz not null default now()
);

create table if not exists public.student_progress (
  student_id uuid primary key references public.profiles (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.classroom_members (
  classroom_id uuid not null references public.classrooms (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (classroom_id, student_id)
);

create index if not exists classrooms_teacher_idx
  on public.classrooms (teacher_id);

create index if not exists classroom_members_student_idx
  on public.classroom_members (student_id);

-- ───────────────────── Funciones auxiliares RLS ─────────────────────
-- Son SECURITY DEFINER para consultar las tablas sin volver a evaluar
-- las políticas y evitar recursión infinita.

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'teacher'
  );
$$;

create or replace function public.is_classroom_teacher(p_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classrooms
    where id = p_classroom_id and teacher_id = auth.uid()
  );
$$;

create or replace function public.is_classroom_member(p_classroom_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classroom_members
    where classroom_id = p_classroom_id and student_id = auth.uid()
  );
$$;

create or replace function public.teacher_of_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classroom_members m
    join public.classrooms c on c.id = m.classroom_id
    where m.student_id = p_student_id
      and c.teacher_id = auth.uid()
  );
$$;

-- ───────────────────────────── RLS ─────────────────────────────

alter table public.profiles enable row level security;
alter table public.student_progress enable row level security;
alter table public.classrooms enable row level security;
alter table public.classroom_members enable row level security;

-- profiles
drop policy if exists "profiles_select_own_or_teacher" on public.profiles;
create policy "profiles_select_own_or_teacher"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.teacher_of_student(id));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- student_progress
drop policy if exists "progress_select_own_or_teacher" on public.student_progress;
create policy "progress_select_own_or_teacher"
  on public.student_progress for select
  to authenticated
  using (student_id = auth.uid() or public.teacher_of_student(student_id));

drop policy if exists "progress_insert_own" on public.student_progress;
create policy "progress_insert_own"
  on public.student_progress for insert
  to authenticated
  with check (student_id = auth.uid());

drop policy if exists "progress_update_own" on public.student_progress;
create policy "progress_update_own"
  on public.student_progress for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- classrooms
drop policy if exists "classrooms_select_member_or_teacher" on public.classrooms;
create policy "classrooms_select_member_or_teacher"
  on public.classrooms for select
  to authenticated
  using (teacher_id = auth.uid() or public.is_classroom_member(id));

drop policy if exists "classrooms_insert_teacher" on public.classrooms;
create policy "classrooms_insert_teacher"
  on public.classrooms for insert
  to authenticated
  with check (teacher_id = auth.uid() and public.is_teacher());

drop policy if exists "classrooms_update_owner" on public.classrooms;
create policy "classrooms_update_owner"
  on public.classrooms for update
  to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

drop policy if exists "classrooms_delete_owner" on public.classrooms;
create policy "classrooms_delete_owner"
  on public.classrooms for delete
  to authenticated
  using (teacher_id = auth.uid());

-- classroom_members
drop policy if exists "members_select_own_or_teacher" on public.classroom_members;
create policy "members_select_own_or_teacher"
  on public.classroom_members for select
  to authenticated
  using (student_id = auth.uid() or public.is_classroom_teacher(classroom_id));

drop policy if exists "members_insert_own" on public.classroom_members;
create policy "members_insert_own"
  on public.classroom_members for insert
  to authenticated
  with check (student_id = auth.uid());

drop policy if exists "members_delete_own_or_teacher" on public.classroom_members;
create policy "members_delete_own_or_teacher"
  on public.classroom_members for delete
  to authenticated
  using (student_id = auth.uid() or public.is_classroom_teacher(classroom_id));

-- ───────────────────── Triggers de integridad ─────────────────────

-- Crea el perfil y su fila de progreso al registrarse.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(coalesce(new.email, 'estudiante@codequest.local'), '@', 1)
    ),
    'student'
  )
  on conflict (id) do nothing;

  insert into public.student_progress (student_id, data)
  values (new.id, '{}'::jsonb)
  on conflict (student_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un usuario autenticado no puede cambiarse el rol a sí mismo.
-- La promoción se hace desde el SQL Editor o con service_role.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role_trigger on public.profiles;
create trigger protect_profile_role_trigger
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Mantiene updated_at del progreso en hora del servidor.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists student_progress_updated_at on public.student_progress;
create trigger student_progress_updated_at
  before update on public.student_progress
  for each row execute function public.set_updated_at();

-- ─────────────────────────── RPCs ───────────────────────────

-- Crear una clase. Solo docentes. Devuelve la clase con su código.
create or replace function public.create_classroom(class_name text)
returns public.classrooms
language plpgsql
security definer
set search_path = public
as $$
declare
  new_class public.classrooms;
  new_code text;
  clean_name text := trim(coalesce(class_name, ''));
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión.';
  end if;

  if not public.is_teacher() then
    raise exception 'Solo las cuentas docentes pueden crear clases.';
  end if;

  if length(clean_name) < 2 then
    raise exception 'El nombre de la clase es demasiado corto.';
  end if;

  loop
    new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.classrooms where join_code = new_code);
  end loop;

  insert into public.classrooms (name, join_code, teacher_id)
  values (left(clean_name, 60), new_code, auth.uid())
  returning * into new_class;

  return new_class;
end;
$$;

-- Unirse a una clase con el código de 6 caracteres.
create or replace function public.join_classroom(p_code text)
returns public.classrooms
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.classrooms;
  clean_code text := upper(trim(coalesce(p_code, '')));
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión.';
  end if;

  select * into target
  from public.classrooms
  where join_code = clean_code;

  if target.id is null then
    raise exception 'El código de clase no existe.';
  end if;

  insert into public.classroom_members (classroom_id, student_id)
  values (target.id, auth.uid())
  on conflict do nothing;

  return target;
end;
$$;

-- Salir de una clase sin borrar el progreso.
create or replace function public.leave_classroom(p_classroom_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión.';
  end if;

  delete from public.classroom_members
  where classroom_id = p_classroom_id
    and student_id = auth.uid();
end;
$$;

-- ───────────────────────── Permisos ─────────────────────────

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.student_progress to authenticated;
grant select, insert, update, delete on public.classrooms to authenticated;
grant select, insert, update, delete on public.classroom_members to authenticated;

revoke all on function public.is_teacher() from public, anon;
revoke all on function public.is_classroom_teacher(uuid) from public, anon;
revoke all on function public.is_classroom_member(uuid) from public, anon;
revoke all on function public.teacher_of_student(uuid) from public, anon;
revoke all on function public.create_classroom(text) from public, anon;
revoke all on function public.join_classroom(text) from public, anon;
revoke all on function public.leave_classroom(uuid) from public, anon;

grant execute on function public.is_teacher() to authenticated;
grant execute on function public.is_classroom_teacher(uuid) to authenticated;
grant execute on function public.is_classroom_member(uuid) to authenticated;
grant execute on function public.teacher_of_student(uuid) to authenticated;
grant execute on function public.create_classroom(text) to authenticated;
grant execute on function public.join_classroom(text) to authenticated;
grant execute on function public.leave_classroom(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Promover una cuenta a docente (ejecutar una sola vez por cuenta):
--
--   update public.profiles
--   set role = 'teacher'
--   where email = 'docente@correo.com';
--
-- Después, esa persona debe cerrar y volver a iniciar sesión para
-- que la app reciba el rol actualizado.
-- ─────────────────────────────────────────────────────────────
