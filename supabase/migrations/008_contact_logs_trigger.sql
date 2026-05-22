-- ============================================================
-- contacts tablosu için otomatik log trigger'ı
-- Her INSERT ve UPDATE işleminde contact_logs'a kayıt atar
-- Kullanıcı adını auth.uid() → profiles tablosundan alır
-- ============================================================

drop trigger if exists trg_contacts_log on contacts;
drop function if exists fn_contacts_log();

create or replace function fn_contacts_log()
returns trigger
language plpgsql
security definer
as $$
declare
  v_changes   jsonb := '{}';
  v_action    text;
  v_user_name text := 'sistem';
  v_cols      text[] := array[
    'sirket_adi','sahip_adi','telefon','email','website_url',
    'google_maps_url','not_kismi','alinan_ucret','alinan_para_birimi',
    'anlasilan_ucret','anlasilan_para_birimi','kalan_ucret','kalan_para_birimi',
    'iletisim_tarihi','sonuc','yapilan_isler','sozlesme_url'
  ];
  v_labels    jsonb := '{
    "sirket_adi":"Şirket Adı",
    "sahip_adi":"Sahip",
    "telefon":"Telefon",
    "email":"E-posta",
    "website_url":"Web Sitesi",
    "google_maps_url":"Google Maps",
    "not_kismi":"Not",
    "alinan_ucret":"Alınan Ücret",
    "alinan_para_birimi":"Alınan Para Birimi",
    "anlasilan_ucret":"Anlaşılan Ücret",
    "anlasilan_para_birimi":"Anlaşılan Para Birimi",
    "kalan_ucret":"Kalan Ücret",
    "kalan_para_birimi":"Kalan Para Birimi",
    "iletisim_tarihi":"İletişim Tarihi",
    "sonuc":"Sonuç",
    "yapilan_isler":"Yapılan İşler",
    "sozlesme_url":"Sözleşme"
  }';
  col       text;
  old_val   text;
  new_val   text;
  label     text;
begin
  -- Giriş yapan kullanıcının adını profiles tablosundan al
  select full_name into v_user_name
  from profiles
  where id = auth.uid()
  limit 1;

  if v_user_name is null then
    v_user_name := 'sistem';
  end if;

  if TG_OP = 'INSERT' then
    v_action  := 'olusturuldu';
    v_changes := jsonb_build_object('sirket_adi', NEW.sirket_adi);

  else
    v_action := 'guncellendi';
    foreach col in array v_cols loop
      old_val := (to_jsonb(OLD) ->> col)::text;
      new_val := (to_jsonb(NEW) ->> col)::text;
      if coalesce(old_val, '') <> coalesce(new_val, '') then
        label     := coalesce(v_labels ->> col, col);
        v_changes := v_changes || jsonb_build_object(
          label,
          jsonb_build_object('eski', coalesce(old_val, '—'), 'yeni', coalesce(new_val, '—'))
        );
      end if;
    end loop;

    -- Hiçbir alan değişmediyse log atma
    if v_changes = '{}' then
      return NEW;
    end if;
  end if;

  insert into contact_logs (contact_id, user_name, action, changes)
  values (NEW.id, v_user_name, v_action, v_changes);

  return NEW;
end;
$$;

create trigger trg_contacts_log
after insert or update on contacts
for each row execute function fn_contacts_log();
