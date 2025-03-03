import { env } from "$amplify/env/norm";
import type { Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ParsedChatCompletion } from "openai/resources/beta/chat/completions";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

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

// Define type from the Zod schema for reuse
type LLMResponseType = z.infer<typeof llmResponseSchema>;

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

async function handleToolCalls(
	toolCalls: Array<{
		function: { name: string; arguments: string };
		id: string;
	}>,
	messages: ChatCompletionMessageParam[],
	userID: string,
) {
	// for each tool call
	for (const toolCall of toolCalls) {
		const args = JSON.parse(toolCall.function.arguments);
		switch (toolCall.function.name) {
			case "lookupCaseNumber": {
				const name = args.name;
				// We can safely use userID here since we check at the handler level
				const result = await lookupCaseNumber(name, userID);

				messages.push({
					role: "tool",
					content: JSON.stringify(result),
					tool_call_id: toolCall.id,
				});
				break;
			}
		}
	}
}

async function processLLMResponse(
	completion: ParsedChatCompletion<LLMResponseType>,
	messages: ChatCompletionMessageParam[],
	currentFormState: Schema["Form"]["type"],
	formID: string,
	userID: string,
) {
	const llmMessage = completion.choices[0].message;

	if (!llmMessage) {
		throw new Error("No message received from OpenAI");
	}

	if (llmMessage.tool_calls?.length) {
		messages.push({
			role: llmMessage.role,
			content: llmMessage.content || "",
			tool_calls: llmMessage.tool_calls,
		});

		await handleToolCalls(llmMessage.tool_calls, messages, userID);

		const followUpCompletion = await openai.beta.chat.completions.parse({
			model: "gpt-4o",
			messages,
			tools,
			response_format: zodResponseFormat(llmResponseSchema, "schema"),
		});

		return processLLMResponse(
			followUpCompletion,
			messages,
			currentFormState,
			formID,
			userID,
		);
	}

	messages.push({
		role: llmMessage.role,
		content: llmMessage.content || "",
	});

	// Return messages and parsed form data without updating the form
	return {
		messages,
		formData: llmMessage.parsed?.form || null,
		followUp: llmMessage.parsed?.followUp || null,
	};
}

// Helper function to format current London time
function formatLondonTime() {
	const options = {
		timeZone: "Europe/London",
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		hour12: true,
	};
	return new Date().toLocaleString(
		"en-GB",
		options as Intl.DateTimeFormatOptions,
	);
}

// Helper function to get tomorrow's date
function getTomorrowDate() {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	return {
		day: tomorrow.getDate(),
		month: tomorrow.getMonth() + 1,
		year: tomorrow.getFullYear(),
	};
}

// Helper function to get user details
async function getUserDetails(userID: string) {
	/* 
	// Commented out until User objects are implemented
	try {
		const { data: userData } = await client.models.User.get({ id: userID });
		if (!userData) {
			return null;
		}
		
		return {
			name: `${userData.firstName} ${userData.lastName}`,
			email: userData.email,
			// Add address fields if they exist in your User model
			address: {
				line1: "", // Replace with actual field from your User model
				town: "",  // Replace with actual field from your User model
				postcode: "" // Replace with actual field from your User model
			}
		};
	} catch (error) {
		console.error("Error fetching user details:", error);
		return null;
	}
	*/

	// Return hardcoded data for Matt Stanbrell
	return {
		name: "Matt Stanbrell",
		address: {
			line1: "123 Fake Street",
			town: "London",
			postcode: "SW1A 1AA",
		},
	};
}

export const handler: Schema["Norm"]["functionHandler"] = async (event) => {
	// Extract user ID directly from Cognito identity
	const userIdFromIdentity = (event.identity as { sub: string }).sub;

	if (!userIdFromIdentity) {
		console.warn("No user ID found in the request identity");
		return {
			followUp:
				"Unable to process your request. User authentication is required.",
			conversationID: "",
			messages: "[]",
			formID: "",
			currentFormState: "{}",
		};
	}

	const { conversationID, messages, formID, currentFormState } =
		event.arguments;

	// Get user details for the system prompt
	const userDetails = await getUserDetails(userIdFromIdentity);

	// Create system message
	const systemMessage = {
		role: "system" as const,
		content: `You are a friendly assistant helping social workers submit prepaid card requests. You help fill out a form based on their natural language requests.

Current time in London: ${formatLondonTime()}

Current social worker details (use these to auto-fill fields if they are the card recipient):
Name: ${userDetails.name}
Address: ${userDetails.address.line1}, ${userDetails.address.town}, ${userDetails.address.postcode}

CRITICAL INSTRUCTIONS:
- NEVER invent or assume information that hasn't been explicitly provided
- ONLY fill form fields when you have EXPLICIT information from the conversation
- Leave fields as null until specific information is provided
- ASK questions to gather missing information, one piece at a time
- DO NOT assume the child is the recipient - always ask who the recipient is
- DO NOT make up dates, addresses, or any other details
- DO NOT provide general advice about purchases or procedures
- FOCUS solely on collecting information to complete the form

Key points:
- Each request needs a case number - if given a child's name, look it up using the lookupCaseNumber tool
- Keep responses friendly and concise
- Only update fields that have new information
- Ask for only 1-2 pieces of information at a time
- If they explicitly say the card is for them, auto-fill their details using the social worker information above
- Update fields immediately upon receiving relevant information
- Use correct grammar and punctuation in form fields, eg "Car seat for Charlie"
- If you receive new information that contradicts previous information, update the form fields accordingly
- Social workers can manually edit the form fields between messages. These updates are already recorded in the form state, so don't repeat them.

IMPORTANT: Your response must be structured as follows:
1. The 'form' object should contain the COMPLETE form with ALL fields, including previously entered information
2. The 'followUp' field should contain your conversational response and any questions

Message formatting:
- Be conversational but efficient in the followUp field
- Ask clear, specific questions to gather missing required information
- Never include form updates in the followUp text - use the form object for that
- Always return the complete form object with all fields, not just the ones you're updating

Examples:
Social worker: "I need £100 to buy a car seat for Charlie Bucket"
Assistant response structure: 
{
  "form": {
    "caseNumber": "12345", // After looking up with tool
    "reason": "Car seat for Charlie Bucket",
    "amount": 100,
    "dateRequired": {
      "day": null,
      "month": null,
      "year": null
    },
    "recipientDetails": {
      "name": {
        "firstName": null,
        "lastName": null
      },
      "address": {
        "lineOne": null,
        "lineTwo": null,
        "townOrCity": null,
        "postcode": null
      }
    }
  },
  "followUp": "I've noted the £100 for Charlie's car seat. When do you need the card by? Also, who will be the recipient of this card?"
}

Social worker: "I need it by March 15th and the card is for me"
Assistant response structure (note how only explicitly provided information is filled in):
{
  "form": {
    "caseNumber": "12345",
    "reason": "Car seat for Charlie Bucket",
    "amount": 100,
    "dateRequired": {
      "day": 15,
      "month": 3,
      "year": 2023 // Assuming current year if not specified
    },
    "recipientDetails": {
      "name": {
        "firstName": "Matt",
        "lastName": "Stanbrell"
      },
      "address": {
        "lineOne": "123 Fake Street",
        "lineTwo": null,
        "townOrCity": "London",
        "postcode": "SW1A 1AA"
      }
    }
  },
  "followUp": "Thank you. I've set the card to be needed by March 15th and added you as the recipient. Is there anything else you'd like to add or change to this request?"
}

Form fields available:
- caseNumber (string) - REQUIRED - Case number of the child the expense is for
- reason (string) - REQUIRED - Reason for the expense
- amount (number) - REQUIRED - Amount of the expense (remove any currency symbols)
- dateRequired.day (number) - REQUIRED - Day of the month the expense is needed by
- dateRequired.month (number) - REQUIRED - Month the expense is needed by
- dateRequired.year (number) - REQUIRED - Year the expense is needed by
- recipientDetails.name.firstName (string) - REQUIRED - First name of the card recipient
- recipientDetails.name.lastName (string) - REQUIRED - Last name of the card recipient
- recipientDetails.address.lineOne (string) - REQUIRED - First line of the card recipient's address
- recipientDetails.address.lineTwo (string) - Optional - Second line of the card recipient's address
- recipientDetails.address.townOrCity (string) - REQUIRED - Town of the card recipient's address
- recipientDetails.address.postcode (string) - REQUIRED - Postcode of the card recipient's address

Remember:
- NEVER invent information - only use what is explicitly provided
- Ask specific questions about missing required fields
- Be natural and friendly in your followUp text
- Always put your conversational response in the followUp field, never in the form object
- ALWAYS return the complete form with all fields, preserving previously entered information
- Your primary goal is to collect information to complete the form, not to give advice`,
	};

	// Parse the messages from the request
	const messagesJSON = JSON.parse(messages ?? "[]");
	const currentFormStateJSON = JSON.parse(currentFormState ?? "{}");

	// Add system message to the beginning of the messages array if it's not already there
	// This ensures the system message is always part of the conversation
	let messagesWithSystem = messagesJSON;
	if (
		messagesJSON.length === 1 ||
		!messagesJSON.some((m: ChatCompletionMessageParam) => m.role === "system")
	) {
		messagesWithSystem = [systemMessage, ...messagesJSON];
	}

	// Create or update the conversation record
	let conversation: Schema["NormConversation"]["type"];
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
					messages: JSON.stringify(messagesWithSystem),
					formID: formID,
				});

			if (!updatedConversation) {
				throw new Error("Failed to update conversation record");
			}

			conversation = updatedConversation;
		} else {
			// Create a new conversation if the ID doesn't exist
			const { data: newConversation } =
				await client.models.NormConversation.create({
					messages: JSON.stringify(messagesWithSystem),
					formID: formID,
				});

			if (!newConversation) {
				throw new Error("Failed to create conversation record");
			}

			conversation = newConversation;
		}
	} else {
		// Create a new conversation if no ID is provided
		const { data: newConversation } =
			await client.models.NormConversation.create({
				messages: JSON.stringify(messagesWithSystem),
				formID: formID,
			});

		if (!newConversation) {
			throw new Error("Failed to create conversation record");
		}

		conversation = newConversation;
	}

	// For now, we'll use a simple response while we're testing the data access
	// In a real implementation, we would call OpenAI here
	const completion = await openai.beta.chat.completions.parse({
		model: "gpt-4o",
		messages: messagesWithSystem,
		tools,
		response_format: zodResponseFormat(llmResponseSchema, "schema"),
	});

	const result = await processLLMResponse(
		completion,
		messagesWithSystem,
		currentFormStateJSON,
		formID,
		userIdFromIdentity,
	);

	// update conversation with new messages, assuming we always have a conversationID
	await client.models.NormConversation.update({
		id: conversation.id,
		messages: JSON.stringify(result.messages),
	});

	// Update form if we have form data from the LLM response
	let updatedForm = currentFormStateJSON;
	if (result.formData) {
		const { data: formData } = await client.models.Form.update({
			id: formID,
			...result.formData,
		});

		if (formData) {
			updatedForm = formData;
		}
	}

	// Return the conversation ID and a simple follow-up message
	return {
		followUp: result.followUp || null,
		conversationID: conversation.id,
		messages: JSON.stringify(result.messages),
		formID: formID,
		currentFormState: JSON.stringify(updatedForm),
	};
};
