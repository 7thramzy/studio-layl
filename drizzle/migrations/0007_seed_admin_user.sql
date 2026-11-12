-- The admin password is stored only as a scrypt hash in the database.
-- Initial credentials: username h@shem; password supplied by the project owner.
INSERT INTO public.admin_users (
  username,
  password_hash,
  display_name,
  role,
  is_active
)
VALUES (
  'h@shem',
  'scrypt$16384$8$1$188a3efb6ae161a026ed366e14d75427$a7e4dc1282d3db95d6f436e07a76d56e27eb916e71e6af9e9ace196633fc5f25fc8bafb7248174309f89940b140acc549b2b81aa857e746ddea9e955b7c3de02',
  'مدير استوديو ليل',
  'admin',
  true
)
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  is_active = true;
