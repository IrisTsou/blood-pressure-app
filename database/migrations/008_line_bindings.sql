create table if not exists line_binding_codes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  code text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists line_binding_codes_patient_id_idx
on line_binding_codes(patient_id);

create table if not exists line_bindings (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  target_type text not null default 'group',
  target_id text not null,
  display_name text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_id, target_type, target_id)
);

create index if not exists line_bindings_patient_id_idx
on line_bindings(patient_id);
