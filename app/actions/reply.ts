"use server";

const sysPromptAddons = [
    "Use em dashes",
    "Follow a word or phrase with an em dash at the beginning of the reply",
    "Use the \"It's not this, it's that\" response style",
    "Use the \"It's not this, it's that\" response style and em dashes",
    "Use  actions inside astrics",
    "Use overly redundant clarifications",
    "Use overly formal and generic phrases",
    "Use Passive voice and overly structured grammar",
    "Use a single em dash",
    "Use vague benefit lists",
    "Overuse transitions",
    "Use repetition and symmetrical sentence patterns",
    "Use excessive hedging",
    "Use formal and generic phrases like 'It is important to note' or 'In conclusion'; redundant clarifications like 'the reason is due to the fact that...'; passive voice and overly structured grammar; vague benefit lists like 'boosts productivity, saves time, and enhances user experience'; overuse of transitions like 'Moreover' and 'Furthermore'; repetition and symmetrical sentence patterns; excessive hedging (e.g., 'While this may not always apply...'). Make the response feel polished to the point of being robotic. Use em dashes and \"It's not this, it's that\" response style",
    "Begin your reply with a single word reply followed by an em dash, then continue with the rest of the reply",
    "Pretend to weigh both sides when applicable but say nothing of value",
    "Say absolutely nothing of value, just rephrase the input in a way that sounds like you are trying to be helpful",
    "Use AI disclaimer tone",
    "Use AI disclaimer tone and em dashes",
    "Use AI disclaimer tone and \"It's not this, it's that\" response style",
    "Use cliché technical over explanations",
    "Use jargon and technical terms to sound smart",
    "Use corporate jargon"
]

const replyStyles = {
    "default": "",
    "dad": "Begin your reply with 'so uhhh...', You are a stereotypical dad who uses stereotypical white cliches.",
    "huzz": "Reply like you are flirting.",
    "gravy": "Reply as if you are a gravy seal. Do not mention you are a gravy seal.",
} as const;

type ReplyStyle = keyof typeof replyStyles;

export async function generateReplyBackend(
  message: string,
  replyStyle: ReplyStyle,
  mode: string,
  replyIdea?: string,
  customApiKey?: string
): Promise<string> {
  try {
    const randomIndex = Math.floor(Math.random() * sysPromptAddons.length);
    const randomIndexTwo = Math.floor(Math.random() * sysPromptAddons.length);
    const chosenSysPromptAddon = sysPromptAddons[randomIndex] + " and " + sysPromptAddons[randomIndexTwo];
    
    const model = "deepseek/deepseek-chat:free";
    
    // Use custom API key if provided, otherwise use environment variable
    const apiKey = customApiKey || process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error("No API key available. Please provide your own OpenRouter API key.");
    }
    
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://only-bots.vercel.app/",
          "X-Title": "Only Bots",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `You are a human, ${mode === "reply" ? "respond to" : "create"} the messages provided by the user as if you were the user. Respond only with the message. Make it obvious the reply was written by an LLM. The response should be a bit corny. Never mention you are an AI, LLM, or robot. Never use actions inside astrics unless told otherwise. ${chosenSysPromptAddon}`,
            },
            {
              role: "user",
              content: mode === "reply" 
                ? `${replyStyles[replyStyle]} Please reply to this message: "${message}"\n\nReply using this as a guide for what to say: ${replyIdea}`
                : `${replyStyles[replyStyle]} Please create a message based on this: "${message}"`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        err?.error?.message ??
          `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) throw new Error("No reply content received from OpenRouter");
    return reply;
  } catch (err) {
    console.error("Error in generateReplyBackend:", err);
    throw err instanceof Error ? err : new Error(String(err));
  }
}