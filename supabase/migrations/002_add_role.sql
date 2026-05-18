-- profiles tablosuna role sütunu ekle
alter table profiles add column if not exists role text not null default 'admin';

-- Mevcut kullanıcıları admin olarak işaretle (isteğe göre super_admin yapılabilir)
-- update profiles set role = 'super_admin' where id = 'YOUR_USER_ID';
