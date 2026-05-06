# Database

This folder keeps the Supabase SQL migrations for the blood pressure app.

Run the files in `migrations/` by filename order when setting up a new Supabase project.

## Migration Order

1. `001_initial_schema.sql`
2. `002_add_auth_to_records.sql`
3. `003_caregiver_model.sql`
4. `004_patients_model.sql`
5. `005_members_and_profiles.sql`
6. `006_notification_settings.sql`
7. `007_notification_events.sql`
8. `008_line_bindings.sql`

These files describe database structure only. Do not commit `.env` files or secret keys.
