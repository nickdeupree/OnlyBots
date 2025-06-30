"use server";

// TODO: Implement this function with your backend logic
async function generateReplyBackend(message: string, replyStyle: string): Promise<string> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {

        method: 'POST',

        headers: {

            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,

            'HTTP-Referer': 'https://only-bots.vercel.app/',

            'X-Title': 'Only Bots',

            'Content-Type': 'application/json',

        },

        body: JSON.stringify({

            model: 'google/gemma-7b-it',

            messages: [

            {

                role: 'system',

                content: 'You are an AI assistant that replies to messages in an obviously AI style. Make your responses a bit corny as well. Use em dashes when appropriate, and when suitable use the "It\'s not this, it\'s that" response style. Follow the user\'s specified tone and style preferences.',

            },

            {

                role: 'user',

                content: `Please reply to this message: "${message}"\n\nReply using this style/tone: ${replyStyle}`,

            },

            ],

        }),

    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extract the reply content from OpenRouter response
    const reply = data.choices?.[0]?.message?.content;
    
    if (!reply) {
      throw new Error("No reply content received from OpenRouter");
    }

    return reply;
  } catch (error) {
    console.error("Error in generateReplyBackend:", error);
    throw new Error(`Failed to generate reply: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

