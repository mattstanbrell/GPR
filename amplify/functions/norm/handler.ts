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
	console.log(`🔍 Looking up child: ${name} for user: ${userID}`);
	// Extract first and last name
	const [firstName, lastName] = name.split(" ");

	if (!firstName || !lastName) {
		throw new Error("Please provide both first and last name");
	}

	// First, get all UserChild records for this user
	console.log(`👥 Fetching UserChild records for user: ${userID}`);
	const { data: userChildren, errors: userChildErrors } =
		await client.models.UserChild.list({
			// @ts-ignore - The type definitions don't match the actual API
			filter: { userID: { eq: userID } },
		});

	if (userChildErrors) {
		console.error(`❌ UserChild query errors:`, userChildErrors);
		throw new Error(
			`Error querying user-child relationships: ${userChildErrors.map((e) => e.message).join(", ")}`,
		);
	}

	console.log(`📊 Found ${userChildren?.length || 0} UserChild records`);

	if (!userChildren || userChildren.length === 0) {
		throw new Error("No children associated with this user");
	}

	// Get all the child IDs associated with this user
	const childIDs = userChildren.map((uc) => uc.childID);
	console.log(`🆔 Child IDs found:`, childIDs);

	// Query each child individually using Promise.all for parallel execution
	console.log(`👶 Fetching individual child records...`);
	const childPromises = childIDs.map((id) => client.models.Child.get({ id }));
	const childResults = await Promise.all(childPromises);

	// Filter out any errors and extract the data
	const children = childResults
		.filter((result) => !result.errors && result.data)
		.map((result) => result.data);

	console.log(`👨‍👩‍👧‍👦 Found ${children.length} valid child records`);

	if (children.length === 0) {
		throw new Error("No children found for this user");
	}

	// Find the child with the matching name
	const foundChild = children.find(
		(child) => child?.firstName === firstName && child?.lastName === lastName,
	);

	if (!foundChild) {
		console.log(`❌ No child found matching name: ${firstName} ${lastName}`);
		throw new Error(`No child named ${name} found for this user`);
	}

	console.log(`✅ Found child:`, foundChild);
	return foundChild;
}

async function handleToolCalls(
	toolCalls: Array<{
		function: { name: string; arguments: string };
		id: string;
	}>,
	messages: ChatCompletionMessageParam[],
	userID: string,
) {
	// Process all tool calls in parallel
	const toolCallPromises = toolCalls.map(async (toolCall) => {
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
	});

	// Wait for all tool calls to complete
	await Promise.all(toolCallPromises);
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

async function getUserDetails(userID: string) {
	/* 
	// Commented out until User objects are actually being used
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
		content: `You are Norm, a friendly assistant helping social workers submit prepaid card requests. You help fill out a form based on their natural language requests.

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

	// Get or create conversation
	let conversationId = conversationID;

	// If no conversation ID is provided, create a new conversation
	if (!conversationId) {
		console.log(`💬 Creating new conversation for form: ${formID}`);
		// Prepare the conversation data
		const conversationData = {
			messages: JSON.stringify(messagesWithSystem),
			formID: formID,
		};

		// Create a new conversation
		const { data: newConversation } =
			await client.models.NormConversation.create(conversationData);

		if (!newConversation) {
			console.error(`❌ Failed to create conversation`);
			throw new Error("Failed to create conversation record");
		}

		console.log(`✅ Created new conversation:`, newConversation.id);
		conversationId = newConversation.id;
	}

	// Call OpenAI with the messages
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

	// Start both update operations in parallel
	console.log(`📝 Updating conversation: ${conversationId}`);
	const conversationUpdatePromise = client.models.NormConversation.update({
		id: conversationId,
		messages: JSON.stringify(result.messages),
	});

	// Only update the form if we have form data
	console.log(
		`📋 Updating form: ${formID} with data:`,
		result.formData ? "yes" : "no",
	);
	const formUpdatePromise = result.formData
		? client.models.Form.update({
				id: formID,
				...result.formData,
				creatorID: userIdFromIdentity,
			})
		: Promise.resolve({ data: currentFormStateJSON });

	// Wait for both operations to complete simultaneously
	const [conversationResult, formResult] = await Promise.all([
		conversationUpdatePromise,
		formUpdatePromise,
	]);

	console.log(
		`✅ Updates completed - Conversation: ${!!conversationResult.data}, Form: ${!!formResult.data}`,
	);

	// Get the updated form data
	const updatedForm = formResult.data || currentFormStateJSON;

	// Return the conversation ID and a simple follow-up message
	return {
		followUp: result.followUp || null,
		conversationID: conversationId,
		messages: JSON.stringify(result.messages),
		formID: formID,
		currentFormState: JSON.stringify(updatedForm),
	};
};
