import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./system-prompt.js";
import { TOOLS } from "./tools.js";

// Default is proportionate to a low-complexity structured-extraction + short-reply
// chat task. Swap to "claude-opus-4-8" here if extraction reliability or
// conversation quality ever needs an upgrade -- everything else stays the same.
const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 1024;
const MAX_TOOL_ROUNDS = 3; // safety cap; a normal turn needs at most 2

const FIELD_LIMITS = {
  name: 200,
  email: 200,
  company: 200,
  position: 200,
  challenge: 4000,
};

function sanitizeFormFill(input) {
  const out = {};
  for (const key of Object.keys(FIELD_LIMITS)) {
    const value = input?.[key];
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    out[key] = trimmed.slice(0, FIELD_LIMITS[key]);
  }
  return out;
}

/**
 * Runs one full turn against Claude, including any tool_use <-> tool_result
 * round trips, and returns a single clean {reply, formFill} for the frontend.
 *
 * This is a bounded loop rather than two hardcoded calls on purpose: adding a
 * second tool later (for the future general-purpose chat phase) just means
 * handling another `block.name` case below -- the loop shape doesn't change.
 */
export async function runTurn(env, incomingMessages) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const messages = [...incomingMessages];
  let formFill = null;
  let finalText = "";

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    const textBlocks = response.content.filter((b) => b.type === "text");
    if (textBlocks.length) {
      finalText = textBlocks.map((b) => b.text).join("\n");
    }

    if (response.stop_reason !== "tool_use") {
      break;
    }

    // Echo the assistant turn back into history -- required for the tool_result round trip.
    messages.push({ role: "assistant", content: response.content });

    const toolResults = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      if (block.name === "fill_challenge_form") {
        formFill = { ...formFill, ...sanitizeFormFill(block.input) };
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: "Recorded.",
        });
      } else {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: "Unknown tool.",
          is_error: true,
        });
      }
    }
    messages.push({ role: "user", content: toolResults });
    // loop continues -- Claude gets a chance to keep talking after the tool call
  }

  return { reply: finalText, formFill };
}
