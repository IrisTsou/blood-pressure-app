alter table care_memberships
add column if not exists can_manage_members boolean not null default false;

alter table care_memberships
drop constraint if exists care_memberships_patient_user_id_caregiver_user_id_key;

alter table care_memberships
add constraint care_memberships_patient_id_caregiver_user_id_key
unique (patient_id, caregiver_user_id);

update care_memberships
set can_manage_members = true
where role in ('manager', 'patient');
