-- Gevyro Aviation Academy: owner-scoped records with typed payloads and optimistic concurrency.
begin;
create function public.academy_touch() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 if new.id <> old.id or new.user_id <> old.user_id then raise exception 'Ownership and identifiers are immutable'; end if;
 new.updated_at = clock_timestamp(); new.version = old.version + 1; return new;
end $$;
revoke all on function public.academy_touch() from public,anon;

create table public.gaa_profiles (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index profiles_owner_updated on public.gaa_profiles(user_id,updated_at);
create index profiles_owner_parent on public.gaa_profiles(user_id,parent_id);
alter table public.gaa_profiles enable row level security;
create policy owner_select on public.gaa_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_profiles for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_profiles from anon;
grant select,insert,update,delete on public.gaa_profiles to authenticated;
create trigger touch before update on public.gaa_profiles for each row execute function public.academy_touch();

create table public.gaa_study_modules (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index study_modules_owner_updated on public.gaa_study_modules(user_id,updated_at);
create index study_modules_owner_parent on public.gaa_study_modules(user_id,parent_id);
alter table public.gaa_study_modules enable row level security;
create policy owner_select on public.gaa_study_modules for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_study_modules for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_study_modules for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_study_modules for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_study_modules from anon;
grant select,insert,update,delete on public.gaa_study_modules to authenticated;
create trigger touch before update on public.gaa_study_modules for each row execute function public.academy_touch();

create table public.gaa_subjects (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index subjects_owner_updated on public.gaa_subjects(user_id,updated_at);
create index subjects_owner_parent on public.gaa_subjects(user_id,parent_id);
alter table public.gaa_subjects enable row level security;
create policy owner_select on public.gaa_subjects for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_subjects for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_subjects for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_subjects for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_subjects from anon;
grant select,insert,update,delete on public.gaa_subjects to authenticated;
create trigger touch before update on public.gaa_subjects for each row execute function public.academy_touch();

create table public.gaa_collections (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index collections_owner_updated on public.gaa_collections(user_id,updated_at);
create index collections_owner_parent on public.gaa_collections(user_id,parent_id);
alter table public.gaa_collections enable row level security;
create policy owner_select on public.gaa_collections for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_collections for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_collections for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_collections for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_collections from anon;
grant select,insert,update,delete on public.gaa_collections to authenticated;
create trigger touch before update on public.gaa_collections for each row execute function public.academy_touch();

create table public.gaa_documents (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index documents_owner_updated on public.gaa_documents(user_id,updated_at);
create index documents_owner_parent on public.gaa_documents(user_id,parent_id);
alter table public.gaa_documents enable row level security;
create policy owner_select on public.gaa_documents for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_documents for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_documents for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_documents for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_documents from anon;
grant select,insert,update,delete on public.gaa_documents to authenticated;
create trigger touch before update on public.gaa_documents for each row execute function public.academy_touch();

create table public.gaa_document_pages (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index document_pages_owner_updated on public.gaa_document_pages(user_id,updated_at);
create index document_pages_owner_parent on public.gaa_document_pages(user_id,parent_id);
alter table public.gaa_document_pages enable row level security;
create policy owner_select on public.gaa_document_pages for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_document_pages for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_document_pages for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_document_pages for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_document_pages from anon;
grant select,insert,update,delete on public.gaa_document_pages to authenticated;
create trigger touch before update on public.gaa_document_pages for each row execute function public.academy_touch();

create table public.gaa_reading_progress (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index reading_progress_owner_updated on public.gaa_reading_progress(user_id,updated_at);
create index reading_progress_owner_parent on public.gaa_reading_progress(user_id,parent_id);
alter table public.gaa_reading_progress enable row level security;
create policy owner_select on public.gaa_reading_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_reading_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_reading_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_reading_progress for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_reading_progress from anon;
grant select,insert,update,delete on public.gaa_reading_progress to authenticated;
create trigger touch before update on public.gaa_reading_progress for each row execute function public.academy_touch();

create table public.gaa_reading_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index reading_sessions_owner_updated on public.gaa_reading_sessions(user_id,updated_at);
create index reading_sessions_owner_parent on public.gaa_reading_sessions(user_id,parent_id);
alter table public.gaa_reading_sessions enable row level security;
create policy owner_select on public.gaa_reading_sessions for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_reading_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_reading_sessions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_reading_sessions for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_reading_sessions from anon;
grant select,insert,update,delete on public.gaa_reading_sessions to authenticated;
create trigger touch before update on public.gaa_reading_sessions for each row execute function public.academy_touch();

create table public.gaa_bookmarks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index bookmarks_owner_updated on public.gaa_bookmarks(user_id,updated_at);
create index bookmarks_owner_parent on public.gaa_bookmarks(user_id,parent_id);
alter table public.gaa_bookmarks enable row level security;
create policy owner_select on public.gaa_bookmarks for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_bookmarks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_bookmarks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_bookmarks for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_bookmarks from anon;
grant select,insert,update,delete on public.gaa_bookmarks to authenticated;
create trigger touch before update on public.gaa_bookmarks for each row execute function public.academy_touch();

create table public.gaa_highlights (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index highlights_owner_updated on public.gaa_highlights(user_id,updated_at);
create index highlights_owner_parent on public.gaa_highlights(user_id,parent_id);
alter table public.gaa_highlights enable row level security;
create policy owner_select on public.gaa_highlights for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_highlights for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_highlights for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_highlights for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_highlights from anon;
grant select,insert,update,delete on public.gaa_highlights to authenticated;
create trigger touch before update on public.gaa_highlights for each row execute function public.academy_touch();

create table public.gaa_annotations (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index annotations_owner_updated on public.gaa_annotations(user_id,updated_at);
create index annotations_owner_parent on public.gaa_annotations(user_id,parent_id);
alter table public.gaa_annotations enable row level security;
create policy owner_select on public.gaa_annotations for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_annotations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_annotations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_annotations for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_annotations from anon;
grant select,insert,update,delete on public.gaa_annotations to authenticated;
create trigger touch before update on public.gaa_annotations for each row execute function public.academy_touch();

create table public.gaa_exercise_workbooks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index exercise_workbooks_owner_updated on public.gaa_exercise_workbooks(user_id,updated_at);
create index exercise_workbooks_owner_parent on public.gaa_exercise_workbooks(user_id,parent_id);
alter table public.gaa_exercise_workbooks enable row level security;
create policy owner_select on public.gaa_exercise_workbooks for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_exercise_workbooks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_exercise_workbooks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_exercise_workbooks for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_exercise_workbooks from anon;
grant select,insert,update,delete on public.gaa_exercise_workbooks to authenticated;
create trigger touch before update on public.gaa_exercise_workbooks for each row execute function public.academy_touch();

create table public.gaa_exercise_sections (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index exercise_sections_owner_updated on public.gaa_exercise_sections(user_id,updated_at);
create index exercise_sections_owner_parent on public.gaa_exercise_sections(user_id,parent_id);
alter table public.gaa_exercise_sections enable row level security;
create policy owner_select on public.gaa_exercise_sections for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_exercise_sections for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_exercise_sections for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_exercise_sections for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_exercise_sections from anon;
grant select,insert,update,delete on public.gaa_exercise_sections to authenticated;
create trigger touch before update on public.gaa_exercise_sections for each row execute function public.academy_touch();

create table public.gaa_questions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index questions_owner_updated on public.gaa_questions(user_id,updated_at);
create index questions_owner_parent on public.gaa_questions(user_id,parent_id);
alter table public.gaa_questions enable row level security;
create policy owner_select on public.gaa_questions for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_questions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_questions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_questions for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_questions from anon;
grant select,insert,update,delete on public.gaa_questions to authenticated;
create trigger touch before update on public.gaa_questions for each row execute function public.academy_touch();

create table public.gaa_question_options (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index question_options_owner_updated on public.gaa_question_options(user_id,updated_at);
create index question_options_owner_parent on public.gaa_question_options(user_id,parent_id);
alter table public.gaa_question_options enable row level security;
create policy owner_select on public.gaa_question_options for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_question_options for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_question_options for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_question_options for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_question_options from anon;
grant select,insert,update,delete on public.gaa_question_options to authenticated;
create trigger touch before update on public.gaa_question_options for each row execute function public.academy_touch();

create table public.gaa_answer_keys (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index answer_keys_owner_updated on public.gaa_answer_keys(user_id,updated_at);
create index answer_keys_owner_parent on public.gaa_answer_keys(user_id,parent_id);
alter table public.gaa_answer_keys enable row level security;
create policy owner_select on public.gaa_answer_keys for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_answer_keys for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_answer_keys for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_answer_keys for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_answer_keys from anon;
grant select,insert,update,delete on public.gaa_answer_keys to authenticated;
create trigger touch before update on public.gaa_answer_keys for each row execute function public.academy_touch();

create table public.gaa_exercise_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index exercise_attempts_owner_updated on public.gaa_exercise_attempts(user_id,updated_at);
create index exercise_attempts_owner_parent on public.gaa_exercise_attempts(user_id,parent_id);
alter table public.gaa_exercise_attempts enable row level security;
create policy owner_select on public.gaa_exercise_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_exercise_attempts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_exercise_attempts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_exercise_attempts for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_exercise_attempts from anon;
grant select,insert,update,delete on public.gaa_exercise_attempts to authenticated;
create trigger touch before update on public.gaa_exercise_attempts for each row execute function public.academy_touch();

create table public.gaa_question_answers (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index question_answers_owner_updated on public.gaa_question_answers(user_id,updated_at);
create index question_answers_owner_parent on public.gaa_question_answers(user_id,parent_id);
alter table public.gaa_question_answers enable row level security;
create policy owner_select on public.gaa_question_answers for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_question_answers for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_question_answers for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_question_answers for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_question_answers from anon;
grant select,insert,update,delete on public.gaa_question_answers to authenticated;
create trigger touch before update on public.gaa_question_answers for each row execute function public.academy_touch();

create table public.gaa_exams (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index exams_owner_updated on public.gaa_exams(user_id,updated_at);
create index exams_owner_parent on public.gaa_exams(user_id,parent_id);
alter table public.gaa_exams enable row level security;
create policy owner_select on public.gaa_exams for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_exams for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_exams for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_exams for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_exams from anon;
grant select,insert,update,delete on public.gaa_exams to authenticated;
create trigger touch before update on public.gaa_exams for each row execute function public.academy_touch();

create table public.gaa_exam_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index exam_attempts_owner_updated on public.gaa_exam_attempts(user_id,updated_at);
create index exam_attempts_owner_parent on public.gaa_exam_attempts(user_id,parent_id);
alter table public.gaa_exam_attempts enable row level security;
create policy owner_select on public.gaa_exam_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_exam_attempts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_exam_attempts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_exam_attempts for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_exam_attempts from anon;
grant select,insert,update,delete on public.gaa_exam_attempts to authenticated;
create trigger touch before update on public.gaa_exam_attempts for each row execute function public.academy_touch();

create table public.gaa_flashcard_decks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index flashcard_decks_owner_updated on public.gaa_flashcard_decks(user_id,updated_at);
create index flashcard_decks_owner_parent on public.gaa_flashcard_decks(user_id,parent_id);
alter table public.gaa_flashcard_decks enable row level security;
create policy owner_select on public.gaa_flashcard_decks for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_flashcard_decks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_flashcard_decks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_flashcard_decks for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_flashcard_decks from anon;
grant select,insert,update,delete on public.gaa_flashcard_decks to authenticated;
create trigger touch before update on public.gaa_flashcard_decks for each row execute function public.academy_touch();

create table public.gaa_flashcards (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index flashcards_owner_updated on public.gaa_flashcards(user_id,updated_at);
create index flashcards_owner_parent on public.gaa_flashcards(user_id,parent_id);
alter table public.gaa_flashcards enable row level security;
create policy owner_select on public.gaa_flashcards for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_flashcards for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_flashcards for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_flashcards for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_flashcards from anon;
grant select,insert,update,delete on public.gaa_flashcards to authenticated;
create trigger touch before update on public.gaa_flashcards for each row execute function public.academy_touch();

create table public.gaa_flashcard_reviews (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index flashcard_reviews_owner_updated on public.gaa_flashcard_reviews(user_id,updated_at);
create index flashcard_reviews_owner_parent on public.gaa_flashcard_reviews(user_id,parent_id);
alter table public.gaa_flashcard_reviews enable row level security;
create policy owner_select on public.gaa_flashcard_reviews for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_flashcard_reviews for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_flashcard_reviews for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_flashcard_reviews for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_flashcard_reviews from anon;
grant select,insert,update,delete on public.gaa_flashcard_reviews to authenticated;
create trigger touch before update on public.gaa_flashcard_reviews for each row execute function public.academy_touch();

create table public.gaa_vocabulary (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index vocabulary_owner_updated on public.gaa_vocabulary(user_id,updated_at);
create index vocabulary_owner_parent on public.gaa_vocabulary(user_id,parent_id);
alter table public.gaa_vocabulary enable row level security;
create policy owner_select on public.gaa_vocabulary for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_vocabulary for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_vocabulary for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_vocabulary for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_vocabulary from anon;
grant select,insert,update,delete on public.gaa_vocabulary to authenticated;
create trigger touch before update on public.gaa_vocabulary for each row execute function public.academy_touch();

create table public.gaa_english_courses (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index english_courses_owner_updated on public.gaa_english_courses(user_id,updated_at);
create index english_courses_owner_parent on public.gaa_english_courses(user_id,parent_id);
alter table public.gaa_english_courses enable row level security;
create policy owner_select on public.gaa_english_courses for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_english_courses for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_english_courses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_english_courses for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_english_courses from anon;
grant select,insert,update,delete on public.gaa_english_courses to authenticated;
create trigger touch before update on public.gaa_english_courses for each row execute function public.academy_touch();

create table public.gaa_english_lessons (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index english_lessons_owner_updated on public.gaa_english_lessons(user_id,updated_at);
create index english_lessons_owner_parent on public.gaa_english_lessons(user_id,parent_id);
alter table public.gaa_english_lessons enable row level security;
create policy owner_select on public.gaa_english_lessons for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_english_lessons for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_english_lessons for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_english_lessons for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_english_lessons from anon;
grant select,insert,update,delete on public.gaa_english_lessons to authenticated;
create trigger touch before update on public.gaa_english_lessons for each row execute function public.academy_touch();

create table public.gaa_english_exercises (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index english_exercises_owner_updated on public.gaa_english_exercises(user_id,updated_at);
create index english_exercises_owner_parent on public.gaa_english_exercises(user_id,parent_id);
alter table public.gaa_english_exercises enable row level security;
create policy owner_select on public.gaa_english_exercises for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_english_exercises for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_english_exercises for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_english_exercises for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_english_exercises from anon;
grant select,insert,update,delete on public.gaa_english_exercises to authenticated;
create trigger touch before update on public.gaa_english_exercises for each row execute function public.academy_touch();

create table public.gaa_lesson_progress (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index lesson_progress_owner_updated on public.gaa_lesson_progress(user_id,updated_at);
create index lesson_progress_owner_parent on public.gaa_lesson_progress(user_id,parent_id);
alter table public.gaa_lesson_progress enable row level security;
create policy owner_select on public.gaa_lesson_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_lesson_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_lesson_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_lesson_progress for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_lesson_progress from anon;
grant select,insert,update,delete on public.gaa_lesson_progress to authenticated;
create trigger touch before update on public.gaa_lesson_progress for each row execute function public.academy_touch();

create table public.gaa_study_goals (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index study_goals_owner_updated on public.gaa_study_goals(user_id,updated_at);
create index study_goals_owner_parent on public.gaa_study_goals(user_id,parent_id);
alter table public.gaa_study_goals enable row level security;
create policy owner_select on public.gaa_study_goals for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_study_goals for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_study_goals for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_study_goals for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_study_goals from anon;
grant select,insert,update,delete on public.gaa_study_goals to authenticated;
create trigger touch before update on public.gaa_study_goals for each row execute function public.academy_touch();

create table public.gaa_study_tasks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index study_tasks_owner_updated on public.gaa_study_tasks(user_id,updated_at);
create index study_tasks_owner_parent on public.gaa_study_tasks(user_id,parent_id);
alter table public.gaa_study_tasks enable row level security;
create policy owner_select on public.gaa_study_tasks for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_study_tasks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_study_tasks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_study_tasks for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_study_tasks from anon;
grant select,insert,update,delete on public.gaa_study_tasks to authenticated;
create trigger touch before update on public.gaa_study_tasks for each row execute function public.academy_touch();

create table public.gaa_study_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index study_sessions_owner_updated on public.gaa_study_sessions(user_id,updated_at);
create index study_sessions_owner_parent on public.gaa_study_sessions(user_id,parent_id);
alter table public.gaa_study_sessions enable row level security;
create policy owner_select on public.gaa_study_sessions for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_study_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_study_sessions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_study_sessions for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_study_sessions from anon;
grant select,insert,update,delete on public.gaa_study_sessions to authenticated;
create trigger touch before update on public.gaa_study_sessions for each row execute function public.academy_touch();

create table public.gaa_user_settings (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index user_settings_owner_updated on public.gaa_user_settings(user_id,updated_at);
create index user_settings_owner_parent on public.gaa_user_settings(user_id,parent_id);
alter table public.gaa_user_settings enable row level security;
create policy owner_select on public.gaa_user_settings for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_user_settings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_user_settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_user_settings for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_user_settings from anon;
grant select,insert,update,delete on public.gaa_user_settings to authenticated;
create trigger touch before update on public.gaa_user_settings for each row execute function public.academy_touch();

create table public.gaa_sync_operations (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 parent_id uuid,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2097152),
 version bigint not null default 1 check (version >= 1),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz,
 unique(user_id,id)
);
create index sync_operations_owner_updated on public.gaa_sync_operations(user_id,updated_at);
create index sync_operations_owner_parent on public.gaa_sync_operations(user_id,parent_id);
alter table public.gaa_sync_operations enable row level security;
create policy owner_select on public.gaa_sync_operations for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert on public.gaa_sync_operations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update on public.gaa_sync_operations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete on public.gaa_sync_operations for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.gaa_sync_operations from anon;
grant select,insert,update,delete on public.gaa_sync_operations to authenticated;
create trigger touch before update on public.gaa_sync_operations for each row execute function public.academy_touch();
alter table public.gaa_document_pages add constraint document_pages_owned_parent foreign key(user_id,parent_id) references public.gaa_documents(user_id,id) deferrable initially deferred;
alter table public.gaa_reading_progress add constraint reading_progress_owned_parent foreign key(user_id,parent_id) references public.gaa_documents(user_id,id) deferrable initially deferred;
alter table public.gaa_reading_sessions add constraint reading_sessions_owned_parent foreign key(user_id,parent_id) references public.gaa_documents(user_id,id) deferrable initially deferred;
alter table public.gaa_bookmarks add constraint bookmarks_owned_parent foreign key(user_id,parent_id) references public.gaa_documents(user_id,id) deferrable initially deferred;
alter table public.gaa_highlights add constraint highlights_owned_parent foreign key(user_id,parent_id) references public.gaa_documents(user_id,id) deferrable initially deferred;
alter table public.gaa_annotations add constraint annotations_owned_parent foreign key(user_id,parent_id) references public.gaa_documents(user_id,id) deferrable initially deferred;
alter table public.gaa_exercise_sections add constraint exercise_sections_owned_parent foreign key(user_id,parent_id) references public.gaa_exercise_workbooks(user_id,id) deferrable initially deferred;
alter table public.gaa_questions add constraint questions_owned_parent foreign key(user_id,parent_id) references public.gaa_exercise_workbooks(user_id,id) deferrable initially deferred;
alter table public.gaa_question_options add constraint question_options_owned_parent foreign key(user_id,parent_id) references public.gaa_questions(user_id,id) deferrable initially deferred;
alter table public.gaa_answer_keys add constraint answer_keys_owned_parent foreign key(user_id,parent_id) references public.gaa_questions(user_id,id) deferrable initially deferred;
alter table public.gaa_exercise_attempts add constraint exercise_attempts_owned_parent foreign key(user_id,parent_id) references public.gaa_exercise_workbooks(user_id,id) deferrable initially deferred;
alter table public.gaa_question_answers add constraint question_answers_owned_parent foreign key(user_id,parent_id) references public.gaa_questions(user_id,id) deferrable initially deferred;
alter table public.gaa_exam_attempts add constraint exam_attempts_owned_parent foreign key(user_id,parent_id) references public.gaa_exams(user_id,id) deferrable initially deferred;
alter table public.gaa_flashcard_reviews add constraint flashcard_reviews_owned_parent foreign key(user_id,parent_id) references public.gaa_flashcards(user_id,id) deferrable initially deferred;
alter table public.gaa_english_lessons add constraint english_lessons_owned_parent foreign key(user_id,parent_id) references public.gaa_english_courses(user_id,id) deferrable initially deferred;
alter table public.gaa_english_exercises add constraint english_exercises_owned_parent foreign key(user_id,parent_id) references public.gaa_english_lessons(user_id,id) deferrable initially deferred;
alter table public.gaa_lesson_progress add constraint lesson_progress_owned_parent foreign key(user_id,parent_id) references public.gaa_english_lessons(user_id,id) deferrable initially deferred;

create unique index documents_owner_hash on public.gaa_documents(user_id,(data->>'hash')) where data->>'hash' is not null;
create unique index reading_progress_owner_document on public.gaa_reading_progress(user_id,parent_id) where parent_id is not null;
create unique index document_pages_owner_number on public.gaa_document_pages(user_id,parent_id,((data->>'page')::integer)) where parent_id is not null;
alter table public.gaa_documents add constraint document_metadata check (length(data->>'title') between 1 and 240 and (data->>'pages')::integer > 0 and (data->>'size')::bigint between 1 and 52428800 and (data->>'hash') ~ '^[0-9a-f]{64}$');
alter table public.gaa_questions add constraint question_metadata check (length(data->>'prompt') > 0 and data->>'kind' in ('multiple','boolean','essay','calculation','matching','fill'));
create function public.academy_sync_record(p_table text,p_id uuid,p_data jsonb,p_parent uuid,p_deleted timestamptz,p_base bigint)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare current_row jsonb; result_row jsonb; uid uuid := auth.uid();
begin
 if uid is null then raise exception 'Authentication required' using errcode = '42501'; end if;
 if not (p_table = any (ARRAY['profiles','study_modules','subjects','collections','documents','document_pages','reading_progress','reading_sessions','bookmarks','highlights','annotations','exercise_workbooks','exercise_sections','questions','question_options','answer_keys','exercise_attempts','question_answers','exams','exam_attempts','flashcard_decks','flashcards','flashcard_reviews','vocabulary','english_courses','english_lessons','english_exercises','lesson_progress','study_goals','study_tasks','study_sessions','user_settings','sync_operations'])) then raise exception 'Invalid entity'; end if;
 -- Per-user/entity/ID lock serializes first inserts as well as updates.
 perform pg_advisory_xact_lock(hashtextextended(uid::text || p_table || p_id::text, 0));
 execute format('select to_jsonb(r) from public.%I r where id=$1 and user_id=$2 for update','gaa_' || p_table) into current_row using p_id,uid;
 if current_row is null then
   if p_base <> 0 then return jsonb_build_object('conflict',true,'row',null); end if;
   execute format('insert into public.%I(id,user_id,parent_id,data,deleted_at) values($1,$2,$3,$4,$5) returning to_jsonb(%I.*)','gaa_' || p_table,'gaa_' || p_table) into result_row using p_id,uid,p_parent,p_data,p_deleted;
 else
   if (current_row->>'version')::bigint <> p_base then return jsonb_build_object('conflict',true,'row',current_row); end if;
   execute format('update public.%I set data=$1,parent_id=$2,deleted_at=$3 where id=$4 and user_id=$5 returning to_jsonb(%I.*)','gaa_' || p_table,'gaa_' || p_table) into result_row using p_data,p_parent,p_deleted,p_id,uid;
 end if;
 return jsonb_build_object('conflict',false,'row',result_row);
end $$;
revoke all on function public.academy_sync_record(text,uuid,jsonb,uuid,timestamptz,bigint) from public,anon;
grant execute on function public.academy_sync_record(text,uuid,jsonb,uuid,timestamptz,bigint) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('gaa-documents','gaa-documents',false,52428800,ARRAY['application/pdf']) on conflict(id) do nothing;
create policy academy_files_read on storage.objects for select to authenticated using(bucket_id='gaa-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy academy_files_insert on storage.objects for insert to authenticated with check(bucket_id='gaa-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- Original files are immutable through the client: no UPDATE policy.
create policy academy_files_delete on storage.objects for delete to authenticated using(bucket_id='gaa-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
commit;
