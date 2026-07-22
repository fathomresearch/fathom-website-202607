CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  last_activity_at TEXT NOT NULL
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  turn_number INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  UNIQUE (conversation_id, turn_number, role)
);

CREATE INDEX messages_conversation_created
  ON messages (conversation_id, created_at);
