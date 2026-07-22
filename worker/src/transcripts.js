export async function saveTranscriptTurn(db, turn) {
  const {
    conversationId,
    turnNumber,
    userMessage,
    assistantMessage,
    formFill,
    createdAt,
  } = turn;

  await db.batch([
    db.prepare(`
      INSERT INTO conversations (id, started_at, last_activity_at)
      VALUES (?1, ?2, ?2)
      ON CONFLICT(id) DO UPDATE SET last_activity_at = excluded.last_activity_at
    `).bind(conversationId, createdAt),
    db.prepare(`
      INSERT INTO messages (
        conversation_id, turn_number, role, content, metadata_json, created_at
      ) VALUES (?1, ?2, 'user', ?3, NULL, ?4)
    `).bind(conversationId, turnNumber, userMessage, createdAt),
    db.prepare(`
      INSERT INTO messages (
        conversation_id, turn_number, role, content, metadata_json, created_at
      ) VALUES (?1, ?2, 'assistant', ?3, ?4, ?5)
    `).bind(
      conversationId,
      turnNumber,
      assistantMessage,
      formFill ? JSON.stringify({ formFill }) : null,
      createdAt,
    ),
  ]);
}
