create table if not exists notification_settings (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade unique,
  high_systolic integer not null default 140,
  high_diastolic integer not null default 90,
  low_systolic integer not null default 90,
  low_diastolic integer not null default 60,
  daily_summary_enabled boolean not null default false,
  daily_summary_time time not null default '21:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
