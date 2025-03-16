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
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

// Now we can use generateClient
const client = generateClient<Schema>();

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const recurrencePatternSchema = z.object({
	frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
	interval: z.number(),
	start_date: z.string(),
	end_date: z.string().optional(),
	max_occurrences: z.number().optional(),
	never_ends: z.boolean().optional(),
	days_of_week: z
		.array(z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]))
		.optional(),
	day_of_month: z.array(z.number()).optional(),
	month_end: z.boolean().optional(),
	month_position: z
		.object({
			position: z.enum(["FIRST", "SECOND", "THIRD", "FOURTH", "LAST"]),
			day_of_week: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
		})
		.optional(),
	months: z.array(z.number()).optional(),
	excluded_dates: z.array(z.string()).optional(),
	description: z.string().optional(),
});

const llmResponseSchema = z.object({
	form: z.object({
		title: z.string(),
		caseNumber: z.string(),
		amount: z.number(),
		reason: z.string(),
		dateRequired: z.object({
			day: z.number(),
			month: z.number(),
			year: z.number(),
		}),
		paymentMethod: z.enum(["PREPAID_CARD", "PURCHASE_ORDER"]).optional(),
		// Add recurring payment fields
		recurring: z.boolean().optional(),
		recurrence_pattern: recurrencePatternSchema.optional(),
		// Conditional fields based on payment method
		recipientDetails: z
			.object({
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
			})
			.optional(),
		businessDetails: z
			.object({
				name: z.string(),
				address: z.object({
					lineOne: z.string(),
					lineTwo: z.string(),
					townOrCity: z.string(),
					postcode: z.string(),
				}),
			})
			.optional(),
		businessID: z.string().optional(),
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
	{
		type: "function" as const,
		function: {
			name: "searchBusinesses",
			description: "Search for businesses by name",
			parameters: {
				type: "object",
				properties: {
					name: {
						type: "string",
						description: "The name of the business to search for",
					},
				},
				required: ["name"],
				additionalProperties: false,
			},
			strict: true,
		},
	},
	{
		type: "function" as const,
		function: {
			name: "parseRecurringPayment",
			description:
				"Parse a natural language description into a structured recurrence pattern, using a provided start date",
			parameters: {
				type: "object",
				properties: {
					description: {
						type: "string",
						description: "Natural language description of a recurring payment schedule",
					},
					start_date: {
						type: "string",
						description: "The start date for the recurring pattern in YYYY-MM-DD format",
					},
				},
				required: ["description", "start_date"],
				additionalProperties: false,
			},
			strict: true,
		},
	},
];

async function lookupCaseNumber(name: string, userID: string) {
	// Extract first and last name
	const [firstName, lastName] = name.split(" ");

	if (!firstName || !lastName) {
		throw new Error("Please provide both first and last name");
	}

	// First, get all UserChild records for this user
	const { data: userChildren, errors: userChildErrors } = await client.models.UserChild.list({
		// @ts-ignore - The type definitions don't match the actual API
		filter: { userID: { eq: userID } },
	});

	if (userChildErrors) {
		throw new Error(`Error querying user-child relationships: ${userChildErrors.map((e) => e.message).join(", ")}`);
	}

	if (!userChildren || userChildren.length === 0) {
		throw new Error("No children associated with this user");
	}

	// Get all the child IDs associated with this user
	const childIDs = userChildren.map((uc) => uc.childID);

	// Query each child individually using Promise.all for parallel execution
	const childPromises = childIDs.map((id) => client.models.Child.get({ id }));
	const childResults = await Promise.all(childPromises);

	// Filter out any errors and extract the data
	const children = childResults.filter((result) => !result.errors && result.data).map((result) => result.data);

	if (children.length === 0) {
		throw new Error("No children found for this user");
	}

	// Find the child with the matching name
	const foundChild = children.find((child) => child?.firstName === firstName && child?.lastName === lastName);

	if (!foundChild) {
		throw new Error(`No child named ${name} found for this user`);
	}

	return foundChild;
}

async function parseRecurringPayment(description: string, start_date: string) {
	// Create a prompt for GPT to parse the description
	const messages = [
		{
			role: "system" as const,
			content: `You are a specialized assistant that converts natural language descriptions of recurring payment schedules into structured JSON objects. Your task is to accurately extract frequency, interval, dates, and other recurrence pattern details from the given text.

Current London time: ${formatLondonTime()}

You will be provided with a start date - use this as the basis for the recurrence pattern. Do not calculate or change the start date.

Examples:
1. "every 2 weeks" with start_date "2024-03-18" ->
{
  "frequency": "WEEKLY",
  "interval": 2,
  "start_date": "2024-03-18",
  "never_ends": true
}

2. "monthly on the first Thursday until end of year" with start_date "2024-03-07" ->
{
  "frequency": "MONTHLY",
  "interval": 1,
  "start_date": "2024-03-07",
  "end_date": "2024-12-31",
  "month_position": {
    "position": "FIRST",
    "day_of_week": "THURSDAY"
  }
}

3. "every day except weekends for 30 occurrences" with start_date "2024-03-12" ->
{
  "frequency": "DAILY",
  "interval": 1,
  "start_date": "2024-03-12",
  "max_occurrences": 30,
  "days_of_week": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
}

Please parse the following description into a valid recurrence pattern, using the provided start date.`,
		},
		{
			role: "user" as const,
			content: `Parse this recurring payment description into a valid recurrence pattern, using start date "${start_date}": "${description}"`,
		},
	];

	// Call OpenAI with a specific schema for recurrence patterns
	const completion = await openai.beta.chat.completions.parse({
		model: "gpt-4o",
		messages,
		response_format: zodResponseFormat(recurrencePatternSchema, "schema"),
	});

	return completion.choices[0].message.parsed;
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
			case "searchBusinesses": {
				const name = args.name;
				console.log("Current messages:", messages);
				const result = await searchBusinesses(name);

				messages.push({
					role: "tool",
					content: JSON.stringify(result),
					tool_call_id: toolCall.id,
				});
				break;
			}
			case "parseRecurringPayment": {
				const { description, start_date } = args;
				const result = await parseRecurringPayment(description, start_date);

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
		console.log("messages after tool call: ", messages);

		const followUpCompletion = await openai.beta.chat.completions.parse({
			model: "gpt-4o",
			messages,
			tools,
			response_format: zodResponseFormat(llmResponseSchema, "schema"),
		});

		return processLLMResponse(followUpCompletion, messages, currentFormState, formID, userID);
	}

	messages.push({
		role: llmMessage.role,
		content: llmMessage.content || "",
	});

	// Process the form data based on payment method
	const initialFormData = llmMessage.parsed?.form || null;
	console.log("LLM parsed form data:", JSON.stringify(initialFormData, null, 2));
	console.log("Current form state:", JSON.stringify(currentFormState, null, 2));

	// Ensure we're handling both payment methods correctly
	const formData = initialFormData
		? {
				...initialFormData,
				// Make sure we preserve the payment method
				paymentMethod: initialFormData.paymentMethod || currentFormState.paymentMethod,
				// Ensure we have the appropriate fields based on payment method
				...(initialFormData.paymentMethod === "PURCHASE_ORDER" || currentFormState.paymentMethod === "PURCHASE_ORDER"
					? {
							businessDetails: initialFormData.businessDetails || currentFormState.businessDetails,
						}
					: {
							recipientDetails: initialFormData.recipientDetails || currentFormState.recipientDetails,
						}),
			}
		: null;

	console.log("Processed form data to return:", JSON.stringify(formData, null, 2));

	// Check for any null or undefined fields that might cause issues
	if (formData) {
		const nullFields = Object.entries(formData)
			.filter(([_, value]) => value === null || value === undefined)
			.map(([key]) => key);

		if (nullFields.length > 0) {
			console.warn("Warning: Form contains null/undefined fields:", nullFields);
		}

		// Ensure required fields are present
		const requiredFields = ["title", "caseNumber", "amount", "reason", "dateRequired", "suggestedFinanceCodeID"];
		const missingFields = requiredFields.filter((field) => !(field in formData));

		if (missingFields.length > 0) {
			console.warn("Warning: Form is missing required fields:", missingFields);
		}
	}

	// Return messages and parsed form data
	return {
		messages,
		formData,
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
	return new Date().toLocaleString("en-GB", options as Intl.DateTimeFormatOptions);
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
			townOrCity: "London",
			postcode: "SW1A 1AA",
		},
	};
}

async function searchBusinesses(name: string) {
	try {
		// Query the Business model to find matches
		const { data: businesses, errors } = await client.models.Business.list({
			// @ts-ignore - The type definitions don't match the actual API
			filter: { name: { contains: name } },
			limit: 5,
		});

		if (errors) {
			throw new Error(`Error searching businesses: ${errors.map((e) => e.message).join(", ")}`);
		}

		if (!businesses || businesses.length === 0) {
			return { message: `No businesses found matching "${name}"` };
		}

		return businesses.map((business) => ({
			id: business.id,
			name: business.name,
			address: business.address,
		}));
	} catch (error) {
		console.error("Error searching businesses:", error);
		return { error: `Failed to search businesses: ${error instanceof Error ? error.message : String(error)}` };
	}
}

export const handler: Schema["Norm"]["functionHandler"] = async (event) => {
	// Extract user ID directly from Cognito identity
	const userIdFromIdentity = (event.identity as { sub: string }).sub;
	console.log("Handler started with userID:", userIdFromIdentity);
	console.log("Event arguments:", JSON.stringify(event.arguments, null, 2));

	if (!userIdFromIdentity) {
		return {
			followUp: "Unable to process your request. User authentication is required.",
			conversationID: "",
			messages: "[]",
			formID: "",
			currentFormState: "{}",
		};
	}

	const { conversationID, messages, formID, currentFormState } = event.arguments;
	console.log("Form ID from arguments:", formID);
	console.log("Current form state from arguments:", currentFormState);

	// Get user details for the system prompt
	const userDetails = await getUserDetails(userIdFromIdentity);

	// Create system message
	const systemMessage = {
		role: "system" as const,
		content: `You are Norm, a friendly and efficient assistant designed to help social workers at Hounslow Council in London submit expense requests by filling out a structured form based on natural-language interactions.

Your primary goal is to gather information step-by-step to fully complete each required form field based on the payment method selected. Ask one clear, friendly question at a time to help social workers easily provide the information needed.

There are two payment methods available:
1. PREPAID_CARD - For providing funds directly to recipients via a prepaid card
2. PURCHASE_ORDER - For ordering goods or services from businesses

Common form fields for both payment methods:
- title (short, descriptive summary of the request)
- caseNumber (child's case number; lookup if needed)
- reason (clear reason for the expense)
- amount (numeric only, no currency symbols)
- dateRequired:
  - day
  - month
  - year
- paymentMethod (either "PREPAID_CARD" or "PURCHASE_ORDER")
- recurring (boolean indicating if this is a recurring payment)
- recurrence_pattern (optional, required if recurring is true)

For PREPAID_CARD payment method, also complete:
- recipientDetails:
  - name:
    - firstName
    - lastName
  - address:
    - lineOne
    - lineTwo (optional)
    - townOrCity
    - postcode

For PURCHASE_ORDER payment method, also complete:
- businessDetails:
  - name
  - address:
    - lineOne
    - lineTwo (optional)
    - townOrCity
    - postcode
- businessID (only if an existing business is selected from the database)

Guidelines for payment method selection:
- Forms default to PREPAID_CARD. Immediately set the payment method to PURCHASE_ORDER if the social worker explicitly requests or clearly indicates ordering from a business or supplier.
- If the payment method isn't clear from the initial request, politely ask the social worker to clarify their preferred payment method.
- Never ask about payment method if the social worker's intended method is already obvious.

Guidelines for recurring payments:
1. If the social worker mentions any recurring schedule (e.g., "every week", "monthly", "twice a month"), set recurring to true.
2. For the start date:
   a. If a clear date is provided (e.g., "March 15th", "next Tuesday", "first Monday of April"), use it directly
   b. If the date is unclear or missing (e.g., "soon", "in a few days", or no date mentioned), ask for one
   c. Format all dates as YYYY-MM-DD when calling the tool
3. After setting up the recurring payment, always include the start date in your response
   Example: "I've set up weekly payments starting from March 15th, 2024."
4. Common recurring payment phrases to watch for:
   - "every X days/weeks/months/years"
   - "monthly on the [position] [day]"
   - "weekly on [days]"
   - "daily except weekends"
   - "until [date]"
   - "for X occurrences"
5. If the recurrence description is unclear, ask specific questions to clarify the pattern

Example recurring payment interactions:

EFFICIENT (Do this):
User: "I need to set up a weekly payment of £50 for John's lunch money starting March 15th"
Action: Use parseRecurringPayment with description "weekly payment" and start_date "2024-03-15"
Response: "I've set up weekly payments of £50 starting from March 15th, 2024. What's John's full name so I can look up the case number?"

User: "Make this payment repeat on the first Thursday of every month starting next month"
Action: Use parseRecurringPayment with description "repeat on the first Thursday of every month" and start_date "2024-04-04"
Response: "I've set up the payment to repeat on the first Thursday of each month, starting from April 4th, 2024."

ALSO EFFICIENT (Do this):
User: "I need weekly payments starting this Tuesday"
Action: Use parseRecurringPayment with description "weekly payments" and start_date "2024-03-12"
Response: "I've set up weekly payments starting from Tuesday, March 12th, 2024."

NEEDS CLARIFICATION (Do this):
User: "I need weekly payments starting soon"
Response: "When would you like these weekly payments to start? Please let me know a specific date."

User: "Let's start from March 20th"
Action: Use parseRecurringPayment with description "weekly payments" and start_date "2024-03-20"
Response: "I've set up weekly payments starting from March 20th, 2024."

Guidelines for business handling:
- When a PURCHASE_ORDER is selected, ask for the business name.
- Use the searchBusinesses tool to check if the business exists in the database.
- If the business exists, present the options to the user and ask them to confirm which one to use.
- If the business is found and confirmed, set the businessID and pre-fill the businessDetails.
- If the business doesn't exist or the user wants to enter details manually, collect the business details directly.
- Never invent a businessID—only use one returned by the searchBusinesses tool.
- If no businessID is available, leave it undefined or empty.

Guidelines for interaction:
- Users may manually edit form fields between messages; always respect these edits. Only update manually edited fields if the social worker provides new, explicit information that directly contradicts or replaces them.
- If given conflicting information, update fields to reflect the most recent data.
- Never guess or invent missing details—politely ask the social worker for clarification whenever information is unclear or incomplete.
- Do not include general advice, instructions, or information unrelated to completing the form.
- Use correct grammar and punctuation in form fields (e.g., "Car seat for Charlie").
- Immediately update fields when relevant information is received.
- Fill out the caseNumber field as soon as possible.

Tool availability:
- lookupCaseNumber: Look up a child's case number using their name.
- searchBusinesses: Search businesses by name when handling PURCHASE_ORDER requests.
- parseRecurringPayment: Convert natural language descriptions of recurring payment schedules into structured patterns. Requires both a description and a start date.

When your response includes a tool call, do not include a followUp message. The user won't see that followUp message anyway.

Social worker details (use these only if explicitly stated by the social worker as the recipient):
- Name: ${userDetails.name}
- Address: ${userDetails.address.line1}, ${userDetails.address.townOrCity}, ${userDetails.address.postcode}

London time: ${formatLondonTime()}

About the "title" field:
- Generate a short, descriptive title summarizing the expense request clearly and concisely.
- Update the title immediately as soon as you understand the primary purpose of the request.
- For PREPAID_CARD: Include recipient and purpose (e.g., "School uniform for Alex", "Food vouchers for Sarah")
- For PURCHASE_ORDER: Include business and purpose (e.g., "School supplies from ABC School Supplies", "Furniture from IKEA")

Example PREPAID_CARD interaction:

User: "I need to request £100 for Charlie Bucket's school uniform."
[Use lookupCaseNumber to find the case number for Charlie Bucket]
Response:
{
  "form": {
    "title": "School uniform for Charlie",
    "paymentMethod": "PREPAID_CARD",
    "caseNumber": "23456", // After looking up the case number
    "reason": "School uniform for Charlie",
    "amount": 100,
    "dateRequired": { "day": null, "month": null, "year": null },
    "recurring": false,
    "recipientDetails": {
      "name": { "firstName": null, "lastName": null },
      "address": { "lineOne": null, "lineTwo": null, "townOrCity": null, "postcode": null }
    }
  },
  "followUp": "When do you need this by?"
}

Example PURCHASE_ORDER interaction:

User: "I need to order £200 of school supplies from ABC School Supplies every month starting March 15th."
[Use searchBusinesses to search for "ABC School Supplies"]
[Use parseRecurringPayment with description "every month" and start_date "2025-03-15"]
[If business found]
Response:
{
  "form": {
    "title": "Monthly school supplies from ABC School Supplies",
    "paymentMethod": "PURCHASE_ORDER",
    "caseNumber": null,
    "reason": "School supplies",
    "amount": 200,
    "dateRequired": { "day": null, "month": null, "year": null },
    "recurring": true,
    "recurrence_pattern": {
      "frequency": "MONTHLY",
      "interval": 1,
      "start_date": "2025-03-15",
      "never_ends": true
    },
    "businessDetails": {
      "name": "ABC School Supplies",
      "address": {
        "lineOne": "123 Education Street", // From the business search result
        "lineTwo": "",
        "townOrCity": "London", // From the business search result
        "postcode": "EC1 2AB" // From the business search result
      }
    },
    "businessID": "b12345" // ID from the business search result
  },
  "followUp": "I found ABC School Supplies in our system and set up monthly recurring payments starting March 15th. What's the case number for this purchase order?"
}

Your approach should be clear, structured, and directly focused on gathering the specific information necessary to complete the form efficiently and accurately.`,
	};

	// Parse the messages from the request
	const messagesJSON = JSON.parse(messages ?? "[]");
	const currentFormStateJSON = JSON.parse(currentFormState ?? "{}");
	console.log("Parsed current form state:", JSON.stringify(currentFormStateJSON, null, 2));

	// Add system message to the beginning of the messages array if it's not already there
	// This ensures the system message is always part of the conversation
	let messagesWithSystem = messagesJSON;
	if (messagesJSON.length === 1 || !messagesJSON.some((m: ChatCompletionMessageParam) => m.role === "system")) {
		messagesWithSystem = [systemMessage, ...messagesJSON];
	}

	// Get or create conversation
	let conversationId = conversationID;

	// If no conversation ID is provided, create a new conversation
	if (!conversationId) {
		// Prepare the conversation data
		const conversationData = {
			messages: JSON.stringify(messagesWithSystem),
			formID: formID,
		};

		// Create a new conversation
		const { data: newConversation } = await client.models.NormConversation.create(conversationData);

		if (!newConversation) {
			throw new Error("Failed to create conversation record");
		}

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

	console.log("Result from processLLMResponse:", {
		followUp: result.followUp,
		formData: JSON.stringify(result.formData, null, 2),
		messagesLength: result.messages.length,
	});

	const conversationUpdatePromise = client.models.NormConversation.update({
		id: conversationId,
		messages: JSON.stringify(result.messages),
	});

	console.log("About to update form with data:", JSON.stringify(result.formData, null, 2));
	console.log("Form ID for update:", formID);

	// Ensure we have a valid form ID before attempting an update
	if (!formID) {
		console.error("No form ID provided for update");
	}

	// Check if we have form data to update
	const hasFormData = result.formData && Object.keys(result.formData).length > 0;
	console.log("Has form data to update:", hasFormData);

	// Create the form update promise
	const formUpdatePromise =
		hasFormData && formID
			? (async () => {
					try {
						// Start with the base update data as a Record type
						const updateData: Record<string, unknown> = {
							id: formID,
							creatorID: userIdFromIdentity,
						};

						// Only add non-empty string fields from result.formData
						if (result.formData && typeof result.formData === "object") {
							// Add each property from result.formData, skipping empty strings
							for (const [key, value] of Object.entries(result.formData)) {
								// Skip businessID if it's an empty string
								if (key === "businessID" && value === "") {
									continue;
								}
								// Otherwise add the field to updateData
								updateData[key] = value;
							}
						}

						console.log("Sending form update with data:", JSON.stringify(updateData, null, 2));

						// Cast to the Form type expected by the update method
						return await client.models.Form.update(updateData as Schema["Form"]["type"]);
					} catch (error) {
						console.error("Error in form update:", error);
						return {
							data: currentFormStateJSON,
							errors: [{ message: `Form update failed: ${error instanceof Error ? error.message : String(error)}` }],
						};
					}
				})()
			: Promise.resolve({
					data: currentFormStateJSON,
					errors: formID ? null : [{ message: "No form ID provided or no data to update" }],
				});

	// Wait for both operations to complete simultaneously
	try {
		console.log("Starting Promise.all for conversation and form updates");
		const [conversationResult, formResult] = await Promise.all([conversationUpdatePromise, formUpdatePromise]);
		console.log("Conversation update result:", JSON.stringify(conversationResult, null, 2));
		console.log("Form update result:", {
			data: formResult.data ? "Data present" : "No data",
			dataType: formResult.data ? typeof formResult.data : "N/A",
			dataKeys: formResult.data ? Object.keys(formResult.data) : [],
			errors: formResult.errors,
		});

		if (formResult.errors) {
			console.error("Form update errors:", JSON.stringify(formResult.errors, null, 2));
		}

		// Get the updated form data
		const updatedForm = formResult.data || currentFormStateJSON;
		console.log("Final updatedForm type:", typeof updatedForm);
		console.log("Final updatedForm keys:", Object.keys(updatedForm));
		console.log("Final updatedForm:", JSON.stringify(updatedForm, null, 2));

		// Check if updatedForm is empty or missing expected fields
		if (!updatedForm || Object.keys(updatedForm).length === 0) {
			console.warn("Warning: updatedForm is empty or null, using currentFormStateJSON as fallback");
			// Use the original form state as a fallback
			const fallbackForm = currentFormStateJSON;
			console.log("Fallback form:", JSON.stringify(fallbackForm, null, 2));
		}

		// Ensure we're returning a valid form state
		const finalFormState = typeof updatedForm === "string" ? updatedForm : JSON.stringify(updatedForm);

		console.log("Final form state to return:", finalFormState);

		// Return the conversation ID and a simple follow-up message
		return {
			followUp: result.followUp || null,
			conversationID: conversationId,
			messages: JSON.stringify(result.messages),
			formID: formID,
			currentFormState: finalFormState,
		};
	} catch (error) {
		console.error("Error during update operations:", error);
		throw error;
	}
};
