import { env } from "$amplify/env/financeCode";
import type { Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Configure Amplify with the proper backend configuration
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

// Now we can use generateClient
const client = generateClient<Schema>();

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const llmResponseSchema = z.object({
	financeCode: z.string(),
});

const systemPrompt = `You are a specialized assistant responsible for selecting the appropriate finance code based on expense requests submitted by social workers. 

You will receive:
- The full conversation history between the social worker and Norm (the assistant managing the form submission).
- The current state of the expense form.

Your task is to:
- Carefully review the conversation history and current form state to fully understand the context and intent of the expense.
- Select the most accurate finance code from the provided list based solely on the provided information.

When responding:
- Provide only the finance code ID (e.g., "D312").
- If multiple codes could fit, select the code that best matches the main purpose or intent.
- If the conversation or form state lacks sufficient detail or is ambiguous, select the finance code that most closely matches based on available information. Do not request further clarification.

Available finance codes:
- A330: Sessional Workers Carebank - For contact supervision, family support, transport
- A340: Sessional Workers Agency - For contact supervision, family support, transport etc
- C411: Public Transport - For contact visits, hospital appointments, court hearings etc.
- C312: Taxi/Minicab Service
- C541: Car Parking charges
- C311: Secure Transport for client
- C593: Mileage Claim
- D312: Children's Clothing - Essential items only
- D711: Subsistence - Food, drink, gas & electric basic necessities, mobile phones, payments to staff for out of Borough visits
- D741: Birthday / Festive Allowance - LAC only
- D13W: Activities Cost - Holidays & Recreation, additional to placement costs
- D111: Equipment Purchase - Cookers, baby equipment, essential items only, staff claim for glasses
- B733: Equipment Maintenance - House cleaning, skips etc
- D540: Storage Expenses - Client belongings in storage units
- D538: Inquiry & Legal Expenses - For cases in pre proceedings, passports, birth certificates, visas etc
- D511: Fees - Family Group Conferences, therapeutic assessments, hair strand testing (for cases not in proceedings)
- B416: Room hire
- D531: Legal Fees-External - Court directed legal spend, only for cases in proceedings
- D591: Interpreting / Translation - Letters, telephone calls etc
- D941: Removal Expenses - Moving YP's belongings between placements, assisting families with removal costs
- E777: Sponsored Childminders - Must be registered, includes after school clubs
- E778: Nursery and Mother & Baby Unit - Sponsored nursery, includes pre-school play groups, and additional costs for Mother & Baby Units not paid through placements (babysitting, additional supervision)
- E779: Sponsored Playgroups - All other playgroups
- F622: Intentionally Homeless - Housing costs, B&B, rent, includes deposits
- G500: Other Recharges - For internal recharging (operational permits, translation, fuel recharges)`;

// Interface for UI messages
interface UIMessage {
	id: number;
	role: "user" | "assistant";
	content: string;
}

// Helper function to extract the actual content from assistant messages
function extractAssistantContent(content: string): string {
	// Try to parse as JSON
	try {
		const parsedContent = JSON.parse(content);

		// Check if there's a followUp field
		if (parsedContent.followUp) {
			return parsedContent.followUp;
		}

		// If no followUp but it's an object, return the original content
		return content;
	} catch (e) {
		// If parsing fails, return the original content
		return content;
	}
}

// Format messages into a conversation format
function formatConversation(messages: UIMessage[]): string {
	return messages
		.map((msg) => {
			if (msg.role === "user") {
				return `User: "${msg.content}"`;
			}

			// For assistant messages, try to extract the followUp content
			const formattedContent = extractAssistantContent(msg.content);
			return `Norm: "${formattedContent}"`;
		})
		.join("\n\n");
}

export const handler: Schema["FinanceCodeFunction"]["functionHandler"] = async (event) => {
	const { messages, currentFormState, formID } = event.arguments;

	try {
		// Parse the messages
		const parsedMessages = JSON.parse(messages) as UIMessage[];
		const parsedFormState = JSON.parse(currentFormState);

		// Format the messages as a conversation
		const formattedConversation = formatConversation(parsedMessages);

		// Prepare messages for OpenAI
		const chatMessages: ChatCompletionMessageParam[] = [
			{
				role: "system",
				content: systemPrompt,
			},
			{
				role: "user",
				content: `Please analyze the following conversation and form data to determine the most appropriate finance code.
				
Form data: ${JSON.stringify(parsedFormState, null, 2)}

Conversation history:
${formattedConversation}

Based on this information, what is the most appropriate finance code?`,
			},
		];

		// Call OpenAI using the beta chat completions parse method with zodResponseFormat
		const completion = await openai.beta.chat.completions.parse({
			model: "gpt-4o-mini",
			messages: chatMessages,
			response_format: zodResponseFormat(llmResponseSchema, "schema"),
		});

		// Extract the finance code from the parsed response
		const financeCode = completion.choices[0].message.parsed?.financeCode;

		if (!financeCode) {
			throw new Error("No finance code in OpenAI response");
		}

		// Update the form with the suggested finance code
		await client.models.Form.update({
			id: formID,
			suggestedFinanceCodeID: financeCode,
		});

		// Return the finance code
		return financeCode;
	} catch (error) {
		console.error("Error in financeCode function:", error);
		throw new Error(`Failed to determine finance code: ${error instanceof Error ? error.message : String(error)}`);
	}
};
