ALTER TABLE messages ADD COLUMN slack_delivered_at TEXT;

CREATE INDEX messages_pending_slack_delivery
  ON messages (slack_delivered_at, created_at);
