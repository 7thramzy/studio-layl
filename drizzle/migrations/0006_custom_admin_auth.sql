CREATE TYPE public.admin_role AS ENUM ('admin', 'editor', 'viewer');

CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE CHECK (char_length(username) BETWEEN 3 AND 80),
  password_hash text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  role public.admin_role NOT NULL DEFAULT 'viewer',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

CREATE TABLE public.admin_sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE INDEX admin_sessions_user_id_idx ON public.admin_sessions(user_id);
CREATE INDEX admin_sessions_expires_at_idx ON public.admin_sessions(expires_at);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.admin_users FROM anon, authenticated;
REVOKE ALL ON public.admin_sessions FROM anon, authenticated;
GRANT ALL ON public.admin_users TO service_role;
GRANT ALL ON public.admin_sessions TO service_role;
