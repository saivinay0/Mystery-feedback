import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const runtime = 'edge';

// Extend the response type to include safety feedback
interface ExtendedGenerateContentResponse {
  safetyFeedback?: { blocked: boolean }[];
}

export async function POST() {
  try {
    const prompt = `Create three light-hearted, engaging questions separated by '||'. 
    Focus on fun, non-personal topics that spark curiosity and friendly interactions.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      start(controller) {
        (async () => {
          try {
            let contentBlocked = false;

            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text.includes('[SAFETY_BLOCKED]')) {
                contentBlocked = true;
                break;
              }
              controller.enqueue(encoder.encode(text));
            }

            // Assert the type of finalResponse with the extended interface
            const finalResponse = (await result.response) as ExtendedGenerateContentResponse;

            if (finalResponse?.safetyFeedback) {
              const flagged = finalResponse.safetyFeedback.some((feedback) => feedback.blocked);
              if (flagged || contentBlocked) {
                controller.enqueue(encoder.encode("⚠️ Content blocked due to safety policies."));
              }
            }
          } catch (streamError) {
            console.error('Stream error:', streamError);
            controller.enqueue(encoder.encode("An error occurred while generating content."));
          }
          controller.close();
        })();
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
