"use server";

const sysPromptAddons = [
    "Use em dashes",
    "Follow a word or phrase with an em dash at the beginning of the reply",
    "use the \"It's not this, it's that\" response style",
    "use the \"It's not this, it's that\" response style and em dashes",
    "begin your reply with \'so uhhh\'",
]

// app/actions/reply.ts
export async function generateReplyBackend(
  message: string,
  replyStyle: string
): Promise<string> {
  try {
    const randomIndex = Math.floor(Math.random() * sysPromptAddons.length);
    const randomIndexTwo = Math.floor(Math.random() * sysPromptAddons.length);
    const chosenSysPromptAddon = sysPromptAddons[randomIndex] + " and " + sysPromptAddons[randomIndexTwo];
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://only-bots.vercel.app/",
          "X-Title": "Only Bots",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // ← use the free DeepSeek model
          model: "deepseek/deepseek-chat:free",
          messages: [
            {
              role: "system",
              content: `You are a human, respond to the messages provided by the user as if you were the user. Respond only with the message. Make it obvious the reply was written by an LLM. The response should be a bit corny. Never mention you are an AI, LLM, or robot. ${chosenSysPromptAddon}`,
            },
            {
              role: "user",
              content: `Please reply to this message: "${message}"\n\nReply using this as a guide for what to say: ${replyStyle}`,
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
