begin;
insert into auth.users(id,email) values ('f0000000-0000-4000-8000-000000000001','academy-test-a@example.invalid'),('f0000000-0000-4000-8000-000000000002','academy-test-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','f0000000-0000-4000-8000-000000000001',true);
select public.academy_sync_record('annotations','f1000000-0000-4000-8000-000000000001','{"body":"private note"}',null,null,0);
do $$begin
 if (select count(*) from public.gaa_annotations where id='f1000000-0000-4000-8000-000000000001')<>1 then raise exception 'Owner cannot read own record'; end if;
end$$;
select set_config('request.jwt.claim.sub','f0000000-0000-4000-8000-000000000002',true);
do $$declare amount integer; begin
 if exists(select from public.gaa_annotations where id='f1000000-0000-4000-8000-000000000001') then raise exception 'Cross-user SELECT allowed'; end if;
 update public.gaa_annotations set data='{"body":"hacked"}' where id='f1000000-0000-4000-8000-000000000001'; get diagnostics amount=row_count;
 if amount<>0 then raise exception 'Cross-user UPDATE allowed'; end if;
 delete from public.gaa_annotations where id='f1000000-0000-4000-8000-000000000001'; get diagnostics amount=row_count;
 if amount<>0 then raise exception 'Cross-user DELETE allowed'; end if;
 begin
 insert into public.gaa_annotations(user_id,data) values('f0000000-0000-4000-8000-000000000001','{}');
 raise exception 'Cross-user INSERT allowed';
 exception when insufficient_privilege then null; end;
 begin
 perform public.academy_sync_record('annotations','f1000000-0000-4000-8000-000000000001','{"body":"hacked"}',null,null,0);
 raise exception 'ID collision allowed';
 exception when unique_violation then null; end;
end$$;
select set_config('request.jwt.claim.sub','f0000000-0000-4000-8000-000000000001',true);
do $$declare result jsonb; begin
 result:=public.academy_sync_record('annotations','f1000000-0000-4000-8000-000000000001','{"body":"v2"}',null,null,1);
 if (result->>'conflict')::boolean or (result->'row'->>'version')::integer<>2 then raise exception 'Version update failed'; end if;
 result:=public.academy_sync_record('annotations','f1000000-0000-4000-8000-000000000001','{"body":"stale"}',null,null,1);
 if not (result->>'conflict')::boolean then raise exception 'Stale write not blocked'; end if;
 begin
 update public.gaa_annotations set user_id='f0000000-0000-4000-8000-000000000002' where id='f1000000-0000-4000-8000-000000000001';
 raise exception 'Ownership change allowed'; exception when raise_exception then if SQLERRM='Ownership change allowed' then raise; end if; end;
end$$;
rollback;
