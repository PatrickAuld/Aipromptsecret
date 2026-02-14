-- Performance and security improvements.

-- Messages: speed up public feed ordering.
CREATE INDEX IF NOT EXISTS "messages_approved_at_idx"
  ON "messages" ("approved_at" DESC)
  WHERE "moderation_status" = 'approved';

-- Featured set messages: speed up ordered retrieval by set.
CREATE INDEX IF NOT EXISTS "featured_set_messages_set_pos_idx"
  ON "featured_set_messages" ("set_id", "position");

-- Ingestion events: common lookups.
CREATE INDEX IF NOT EXISTS "ingestion_events_message_id_idx"
  ON "ingestion_events" ("message_id");

CREATE INDEX IF NOT EXISTS "ingestion_events_parse_status_received_at_idx"
  ON "ingestion_events" ("parse_status", "received_at" DESC);

-- IP denylist: enable RLS + restrict access to admins.
DO $$ BEGIN
  IF to_regclass('public.ip_denylist') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE ip_denylist ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "ip_denylist_admin_all" ON ip_denylist';
    EXECUTE 'CREATE POLICY "ip_denylist_admin_all" ON ip_denylist'
      || ' FOR ALL TO authenticated'
      || ' USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid()))'
      || ' WITH CHECK (EXISTS (SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid()))';
  END IF;
END $$;

-- Reduce attack surface: do not expose the denylist helper to public roles.
-- (Service role should retain access.)
DO $$ BEGIN
  IF to_regprocedure('public.ip_is_denied(inet)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION ip_is_denied(inet) FROM PUBLIC';
    EXECUTE 'GRANT EXECUTE ON FUNCTION ip_is_denied(inet) TO service_role';
  END IF;
END $$;
