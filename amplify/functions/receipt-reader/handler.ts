import type { Handler } from 'aws-lambda';
import { env } from "$amplify/env/receipt-reader";
import OpenAI from "openai";
import type { AnalysisResult } from "../../shared/types";
import { SYSTEM_PROMPT } from "../../shared/types";

interface LambdaEvent {
  arguments: {
    base64Data: string;
    mimeType: string;
  };
}

export const handler: Handler = async (event: LambdaEvent) => {
  try {
    const { base64Data, mimeType } = event.arguments;
    console.log("Sending to GPT-4...");
    const startTime = Date.now();

    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    // Use the provided mimeType for the data URI
    const imageUrl = `data:${mimeType};base64,${base64Data}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
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
      max_tokens: 2000,
      temperature: 0.1,
    });

    console.log("GPT-4 response:", response);

    const modelResponse = response.choices[0].message.content?.trim();
    if (!modelResponse) {
      throw new Error("No response from the model.");
    }
    const parsedResponse = JSON.parse(modelResponse);
    const { total, items } = parsedResponse;

    const timeTaken = Date.now() - startTime;
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const cost = 0.004; // Hardcoded cost for gpt-4o-mini

    // Return the JSON result directly
    return {
      total,
      items,
      timeTaken,
      cost,
      tokenInfo: {
        inputTokens,
        outputTokens,
      },
    } as AnalysisResult;
  } catch (error: unknown) {
    console.error("GPT-4 analysis error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};
