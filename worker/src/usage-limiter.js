import { DurableObject } from "cloudflare:workers";

export const LIMITS = Object.freeze({
  conversationsPerDay: 5,
  userTurnsPerDay: 75,
  userTurnsPerConversation: 25,
  conversationLifetimeMs: 60 * 60 * 1000,
});

function emptyUsage(day) {
  return {
    day,
    conversationsStarted: 0,
    userTurns: 0,
    conversations: {},
  };
}

export class IpUsageLimiter extends DurableObject {
  async startConversation({ day, conversationId, now }) {
    let usage = (await this.ctx.storage.get("usage")) || emptyUsage(day);
    if (usage.day !== day) usage = emptyUsage(day);

    if (usage.conversationsStarted >= LIMITS.conversationsPerDay) {
      return {
        allowed: false,
        code: "daily_conversation_limit",
        message: "You have reached today's conversation limit. Please try again tomorrow.",
      };
    }
    if (usage.userTurns >= LIMITS.userTurnsPerDay) {
      return {
        allowed: false,
        code: "daily_turn_limit",
        message: "You have reached today's assistant usage limit. Please try again tomorrow.",
      };
    }

    usage.conversationsStarted += 1;
    usage.userTurns += 1;
    usage.conversations[conversationId] = {
      createdAt: now,
      lastActivityAt: now,
      userTurns: 1,
    };

    await this.ctx.storage.put("usage", usage);
    return {
      allowed: true,
      conversationId,
      userTurns: 1,
      turnsRemaining: LIMITS.userTurnsPerConversation - 1,
    };
  }

  async recordTurn({ day, conversationId, now, presentedUserTurns }) {
    let usage = (await this.ctx.storage.get("usage")) || emptyUsage(day);
    if (usage.day !== day) usage = emptyUsage(day);

    const conversation = usage.conversations[conversationId];
    if (!conversation) {
      return {
        allowed: false,
        code: "invalid_conversation",
        message: "This conversation is no longer available. Please start a new session.",
      };
    }

    if (now - conversation.createdAt > LIMITS.conversationLifetimeMs) {
      delete usage.conversations[conversationId];
      await this.ctx.storage.put("usage", usage);
      return {
        allowed: false,
        code: "conversation_expired",
        message: "This brainstorming session has expired. Please start a new session.",
      };
    }

    if (conversation.userTurns >= LIMITS.userTurnsPerConversation) {
      return {
        allowed: false,
        code: "conversation_turn_limit",
        message: "This brainstorming session has reached its 25-turn limit. You can now review and submit the form.",
      };
    }

    // The browser sends history for Claude, but the server owns the authoritative
    // turn count. This catches missing, duplicated, or reset client history.
    if (presentedUserTurns !== conversation.userTurns + 1) {
      return {
        allowed: false,
        code: "conversation_out_of_sync",
        message: "The conversation is out of sync. Please refresh and start a new session.",
      };
    }

    if (usage.userTurns >= LIMITS.userTurnsPerDay) {
      return {
        allowed: false,
        code: "daily_turn_limit",
        message: "You have reached today's assistant usage limit. Please try again tomorrow.",
      };
    }

    conversation.userTurns += 1;
    conversation.lastActivityAt = now;
    usage.userTurns += 1;

    await this.ctx.storage.put("usage", usage);
    return {
      allowed: true,
      conversationId,
      userTurns: conversation.userTurns,
      turnsRemaining: LIMITS.userTurnsPerConversation - conversation.userTurns,
    };
  }
}
