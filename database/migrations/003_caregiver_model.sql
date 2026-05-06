create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone text,
  line_user_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists care_memberships (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null references auth.users(id) on delete cascade,
  caregiver_user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'caregiver',
  can_view boolean not null default true,
  can_create boolean not null default true,
  can_update boolean not null default true,
  can_delete boolean not null default false,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_user_id, caregiver_user_id)
);

create index if not exists care_memberships_patient_user_id_idx
on care_memberships(patient_user_id);

create index if not exists care_memberships_caregiver_user_id_idx
on care_memberships(caregiver_user_id);

alter table blood_pressure_records
add column if not exists created_by uuid references auth.users(id) on delete set null,
add column if not exists updated_by uuid references auth.users(id) on delete set null;

update blood_pressure_records
set
  created_by = patient_user_id,
  updated_by = patient_user_id
where created_by is null
   or updated_by is null;
