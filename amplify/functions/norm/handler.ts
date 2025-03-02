import { env } from "$amplify/env/norm";
import type { Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

// Configure Amplify with the proper backend configuration
const { resourceConfig, libraryOptions } =
	await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

// Now we can use generateClient
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

async function lookupCaseNumber(name: string, userID: string) {
	// Hardcoded to look for "Charlie Bucket" for now
	const firstName = "Charlie";
	const lastName = "Bucket";

	if (!userID) {
		throw new Error("User not authenticated or user ID not available");
	}

	// Find all UserChild records for the current user
	const { data: userChildren, errors: userChildErrors } =
		await client.models.UserChild.list({
			filter: { userID: { eq: userID } },
		});

	if (userChildErrors) {
		console.error("Error finding user's children:", userChildErrors);
		throw new Error("Failed to retrieve children associated with the user");
	}

	if (!userChildren || userChildren.length === 0) {
		throw new Error("No children associated with this user");
	}

	// Get all the child IDs associated with this user
	const childIDs = userChildren.map((uc) => uc.childID);

	// Find the specific child by name among the user's children
	// Use multiple separate queries instead of 'in' operator which isn't supported in the type
	const foundChildren: Array<Schema["Child"]["type"]> = [];

	// Query each child individually
	for (const childID of childIDs) {
		const { data: child, errors: childErrors } = await client.models.Child.get({
			id: childID,
		});

		if (
			!childErrors &&
			child &&
			child.firstName === firstName &&
			child.lastName === lastName
		) {
			foundChildren.push(child);
		}
	}

	if (foundChildren.length === 0) {
		throw new Error(`No child named ${name} found for this user`);
	}

	// Return the found child
	return foundChildren[0];
}

// Type for the identity object in AppSync events
type AppSyncIdentity = {
	sub?: string;
	issuer?: string;
	username?: string;
	claims?: Record<string, string | number | boolean>;
	sourceIp?: string[];
	defaultAuthStrategy?: string;
};

export const handler: Schema["Norm"]["functionHandler"] = async (event) => {
	// Extract user ID from the identity context
	console.log(event);
	const identity = event.identity as AppSyncIdentity;

	// Get user ID from the identity object, ensuring it's a string
	let userIdFromIdentity: string | undefined;

	if (identity?.sub) {
		userIdFromIdentity = identity.sub;
	} else if (identity?.claims?.sub && typeof identity.claims.sub === "string") {
		userIdFromIdentity = identity.claims.sub;
	} else if (identity?.username) {
		userIdFromIdentity = identity.username;
	}

	const { conversationID, messages, formID, currentFormState } =
		event.arguments;

	const messagesJSON = JSON.parse(messages ?? "[]");
	const currentFormStateJSON = JSON.parse(currentFormState ?? "{}");

	// Create or update the conversation record
	let conversationRecord: Schema["NormConversation"]["type"] | null = null;
	if (conversationID) {
		// If we have a conversationID, get the existing conversation
		const { data: existingConversation } =
			await client.models.NormConversation.get({
				id: conversationID,
			});

		if (existingConversation) {
			// Update the existing conversation with new messages
			const { data: updatedConversation } =
				await client.models.NormConversation.update({
					id: conversationID,
					messages: messages,
					formID: formID,
				});
			conversationRecord = updatedConversation;
		} else {
			// Create a new conversation if the ID doesn't exist
			const { data: newConversation } =
				await client.models.NormConversation.create({
					messages: messages,
					formID: formID,
				});
			conversationRecord = newConversation;
		}
	} else {
		// Create a new conversation if no ID is provided
		const { data: newConversation } =
			await client.models.NormConversation.create({
				messages: messages,
				formID: formID,
			});
		conversationRecord = newConversation;
	}

	// Hardcoded lookup call for "Charlie Bucket"
	let childInfo = null;
	try {
		if (userIdFromIdentity) {
			const child = await lookupCaseNumber(
				"Charlie Bucket",
				userIdFromIdentity,
			);
			childInfo = {
				caseNumber: child.id,
				name: `${child.firstName} ${child.lastName}`,
				dateOfBirth: child.dateOfBirth,
			};
			console.log("Found child:", childInfo);
		} else {
			console.error("No user ID available for child lookup");
		}
	} catch (error) {
		console.error("Error looking up child:", error);
	}

	// For now, we'll use a simple response while we're testing the data access
	// In a real implementation, we would call OpenAI here
	// const completion = await openai.beta.chat.completions.parse({
	// 	model: "gpt-4o",
	// 	messages: messagesJSON,
	// 	tools,
	// 	response_format: zodResponseFormat(llmResponseSchema, "schema"),
	// });

	if (!conversationRecord) {
		throw new Error("Failed to create or update conversation record");
	}

	// Return the conversation ID and a simple follow-up message
	return {
		followUp: childInfo
			? `I found ${childInfo.name} with case number ${childInfo.caseNumber}. How can I help you with this form?`
			: "How can I help you with this form?",
		conversationID: conversationRecord.id,
		messages: messages,
		formID: formID,
		currentFormState: currentFormState,
	};
};
