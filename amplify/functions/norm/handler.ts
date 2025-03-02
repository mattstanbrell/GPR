import { env } from "$amplify/env/norm";
import type { Schema } from "../../data/resource";
import { generateClient } from "aws-amplify/data";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const client = generateClient<Schema>();

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const llmResponseSchema = z.object({
	form: z.object({
		caseNumber: z.string(),
		amount: z.number(),
		reason: z.string(),
		dateRequired: z.object({
			day: z.number(),
			month: z.number(),
			year: z.number(),
		}),
		recipientDetails: z.object({
			name: z.object({
				firstName: z.string(),
				lastName: z.string(),
			}),
			address: z.object({
				lineOne: z.string(),
				lineTwo: z.string(),
				townOrCity: z.string(),
				postcode: z.string(),
			}),
		}),
	}),
	followUp: z.string(),
});

const tools = [
	{
		type: "function" as const,
		function: {
			name: "lookupCaseNumber",
			description: "Lookup a child's case number by name",
			parameters: {
				type: "object",
				properties: {
					name: {
						type: "string",
						description: "The name of the child",
					},
				},
				required: ["name"],
				additionalProperties: false,
			},
			strict: true,
		},
	},
];

async function lookupCaseNumber(name: string) {
	// Split the full name into first and last name
	const nameParts = name.trim().split(" ");
	const lastName = nameParts.pop() || ""; // Last part is the last name
	const firstName = nameParts.join(" "); // Everything else is the first name

	// Use the new findByName query to search for the child
	const { data: children, errors } = await client.models.Child.findByName({
		lastName: lastName,
		firstName: {
			beginsWith: firstName,
		},
	});

	if (errors) {
		console.error("Error finding child:", errors);
		throw new Error(`Failed to find child with name: ${name}`);
	}

	if (!children || children.length === 0) {
		throw new Error(`No child found with name: ${name}`);
	}

	// Return the found child
	return children[0];
}

export const handler: Schema["Norm"]["functionHandler"] = async (event) => {
	const { conversationID, messages, formID, currentFormState } =
		event.arguments;

	const messagesJSON = JSON.parse(messages ?? "[]");
	const currentFormStateJSON = JSON.parse(currentFormState ?? "{}");

	if (!conversationID) {
		await client.models.NormConversation.create({ messages, formID });
	}

	const completion = await openai.beta.chat.completions.parse({
		model: "gpt-4o",
		messages: messagesJSON,
		tools,
		response_format: zodResponseFormat(llmResponseSchema, "schema"),
	});

	return {
		followUp: "Hello",
		conversationID: "123",
		messages: "Hello",
		formID: "123",
		currentFormState: "Hello",
	};
};
