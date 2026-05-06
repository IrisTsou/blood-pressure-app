alter table care_memberships
add column if not exists notify_on_alert boolean not null default true,
add column if not exists notify_on_daily_summary boolean not null default false;

create table if not exists notification_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  record_id uuid references blood_pressure_records(id) on delete cascade,
  event_type text not null,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists notification_events_patient_id_idx
on notification_events(patient_id);

create index if not exists notification_events_status_idx
on notification_events(status);
