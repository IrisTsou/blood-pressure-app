create table if not exists blood_pressure_records (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null references auth.users(id) on delete cascade,
  measured_date date not null,
  measured_time time not null,
  systolic integer not null,
  diastolic integer not null,
  pulse integer not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blood_pressure_records_patient_user_id_idx
on blood_pressure_records(patient_user_id);
