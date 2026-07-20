// Isolated on purpose: adding a second tool later (for the future general-purpose
// chat phase) means adding another entry to this array, not restructuring anything.

export const FILL_FORM_TOOL = {
  name: "fill_challenge_form",
  description:
    "Record the visitor's contact and challenge details, so the website can pre-fill the " +
    "review form. Call this ONCE, after you've had the actual conversation and gathered a " +
    "real sense of the fields you're confident about -- not after every message. Filling the " +
    "form mid-conversation is distracting for the visitor watching it happen. Only include " +
    "fields you are confident about from what the visitor explicitly said; never invent or " +
    "guess a value. It's fine to call this again later ONLY if the visitor corrects or adds " +
    "something after the form has already been filled once.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "The visitor's full name" },
      email: { type: "string", description: "The visitor's email address" },
      company: { type: "string", description: "The visitor's company name" },
      position: { type: "string", description: "The visitor's job title or role" },
      challenge: {
        type: "string",
        description:
          "A concise 2-4 sentence summary, in plain language, of the decision or problem " +
          "the visitor is facing and their timeline -- not a verbatim transcript of the chat.",
      },
    },
    required: [],
  },
};

export const TOOLS = [FILL_FORM_TOOL];
