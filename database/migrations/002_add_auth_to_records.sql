alter table blood_pressure_records
add column if not exists patient_user_id uuid references auth.users(id) on delete cascade;

create index if not exists blood_pressure_records_patient_user_id_idx
on blood_pressure_records(patient_user_id);

-- 如果目前資料表裡有舊測試資料，先刪掉再把 patient_user_id 設成 not null。
-- 真正上線資料不要直接刪，需要先決定舊資料屬於哪位使用者。
delete from blood_pressure_records
where patient_user_id is null;

alter table blood_pressure_records
alter column patient_user_id set not null;
