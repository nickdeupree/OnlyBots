import { NextRequest, NextResponse } from "next/server";

import { generateReplyBackend } from "../../actions/reply"; // Adjust the import path as needed

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, replyStyle, mode, replyIdea, customApiKey } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const reply = await generateReplyBackend(
      message,
      replyStyle,
      mode,
      replyIdea,
      customApiKey,
    );

    return NextResponse.json({ reply });
  } catch (error) {
    // Return more detailed error information
    let errorMessage = "Failed to generate reply";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
