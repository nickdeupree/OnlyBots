import { NextRequest, NextResponse } from 'next/server';
import { generateReplyBackend } from '../../actions/reply'; // Adjust the import path as needed

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, replyStyle } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    
    // TODO: Implement your backend logic here
    const reply = await generateReplyBackend(message, replyStyle);
    
    return NextResponse.json({ reply });
    
  } catch (error) {
    console.error('Error generating reply:', error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Return more detailed error information
    let errorMessage = "Failed to generate reply";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
