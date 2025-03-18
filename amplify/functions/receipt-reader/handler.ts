import type { Handler } from 'aws-lambda';
import { env } from "$amplify/env/receipt-reader";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { SYSTEM_PROMPT } from '../../shared/types';

interface LambdaEvent {
  arguments: {
    base64Data: string;
    mimeType: string;
  };
}

// Define the Zod schema for the expected output
const ReceiptAnalysisSchema = z.object({
  total: z.string(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    cost: z.number(),
  })),
});

export const handler: Handler = async (event: LambdaEvent) => {
  try {
    const { base64Data, mimeType } = event.arguments;
    console.log("Sending to GPT-4...");
    const startTime = Date.now();

    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    const imageUrl = `data:${mimeType};base64,${base64Data}`;

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      response_format: zodResponseFormat(ReceiptAnalysisSchema, "receipt_analysis"),
      max_tokens: 2000,
      temperature: 0.1,
    });

    const parsedResponse = completion.choices[0].message.parsed;
    if (!parsedResponse) {
      throw new Error("No response from the model.");
    }

    const { total, items } = parsedResponse;

    const timeTaken = Date.now() - startTime;
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    const cost = 0.004; 

    return {
      total,
      items,
      timeTaken,
      cost,
      tokenInfo: {
        inputTokens,
        outputTokens,
      },
    };
  } catch (error: unknown) {
    console.error("GPT-4 analysis error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};
