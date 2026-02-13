-- Add ingestion protections: IP denylist + parse_status values.

-- Extend parse_status enum to support new ingestion outcomes.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'too_long' AND enumtypid = 'parse_status'::regtype) THEN
    ALTER TYPE parse_status ADD VALUE 'too_long';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'denied_ip' AND enumtypid = 'parse_status'::regtype) THEN
    ALTER TYPE parse_status ADD VALUE 'denied_ip';
  END IF;
END $$;

-- Store denied IPs (exact string match).
CREATE TABLE IF NOT EXISTS ip_denylist (
  ip text PRIMARY KEY,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
