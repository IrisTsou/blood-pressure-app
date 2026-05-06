create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  birth_year integer,
  note text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists patients_created_by_idx
on patients(created_by);

alter table care_memberships
add column if not exists patient_id uuid references patients(id) on delete cascade;

alter table blood_pressure_records
add column if not exists patient_id uuid references patients(id) on delete cascade;

-- 如果你目前還沒有正式資料，建議先手動清空舊測試資料後再執行 not null。
-- delete from blood_pressure_records;
-- delete from care_memberships;

create index if not exists care_memberships_patient_id_idx
on care_memberships(patient_id);

create index if not exists blood_pressure_records_patient_id_idx
on blood_pressure_records(patient_id);

-- 方案 B 之後會使用 patient_id，不再使用 patient_user_id。
-- 等資料搬移完成後，可以再手動移除舊欄位：
-- alter table care_memberships drop column if exists patient_user_id;
-- alter table blood_pressure_records drop column if exists patient_user_id;
