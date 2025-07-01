interface WarmupResponse {
    status: string;
}

interface ErrorResponse {
    error: string;
}

export async function GET() {
    try {
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
                    model: "deepseek/deepseek-chat-v3-0324:free",
                    messages: [
                        {
                            role: "user",
                            content: `hi`,
                        },
                    ],
                    max_tokens: 1,
                    temperature: 0,
                }),
            }
        );

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(
                err?.error?.message ??
                `OpenRouter API Warmup error: ${response.status} ${response.statusText}`
            );
        }

        return Response.json({ status: 'Warmed' });
    } catch (error) {
        console.error('Warmup failed:', error);
        return Response.json(
            { error: 'Failed to warm up API' },
            { status: 500 }
        );
    }
}
