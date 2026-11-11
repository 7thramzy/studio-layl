# Studio Layl project rules

- The Studio Layl UI lives in `src/components/StudioLayl.tsx` with its own stylesheet `src/studio-layl.css`.
- Works live in the `tracks` table. Public visitors can read published works; administrators manage works through Supabase RLS.
- Audio lives in the private `track-audio` bucket and is streamed through signed URLs from `src/lib/studio.server.ts`.
- The first account created is made admin by the database trigger; never grant admin from client code.
- Mood recommendations run locally in `src/lib/studio.functions.ts` using the real catalog. Do not add external AI providers without explicit approval.
- Keep Supabase service-role credentials server-only. Never expose them through `VITE_*` variables.
- Apply database changes through the SQL migrations in `drizzle/migrations/` and keep migration order intact.
- Production deployment targets Vercel with the Nitro `vercel` preset.
