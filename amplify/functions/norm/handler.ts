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

// Now we can use generateClien
const client = generateClient<Schema>();

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const recurrencePatternSchema = z.object({
	frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
	interval: z.number(),
	startDate: z.string(),
	endDate: z.string().optional(),
	maxOccurrences: z.number().optional(),
	neverEnds: z.boolean().optional(),
	daysOfWeek: z
		.array(z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]))
		.optional(),
	dayOfMonth: z.array(z.number()).optional(),
	monthEnd: z.boolean().optional(),
	monthPosition: z
		.object({
			position: z.enum(["FIRST", "SECOND", "THIRD", "FOURTH", "LAST"]),
			dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
		})
		.optional(),
	months: z.array(z.string()).optional(),
	excludedDates: z.array(z.string()).optional(),
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
		expenseType: z.enum(["PREPAID_CARD", "PURCHASE_ORDER"]).optional(),
		section17: z.boolean().optional(),
		// Add recurring payment fields
		isRecurring: z.boolean().optional(),
		recurrencePattern: recurrencePatternSchema.optional(),
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
			name: "parseRecurring",
			description: "Convert natural language descriptions of recurring schedules into structured patterns",
			parameters: {
				type: "object",
				properties: {
					description: {
						type: "string",
						description: "The natural language description of the recurring schedule",
					},
					startDate: {
						type: "string",
						description: "The start date in YYYY-MM-DD format",
					},
				},
				required: ["description", "startDate"],
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

async function parseRecurring(description: string, startDate: string) {
	const completion = await openai.beta.chat.completions.parse({
		model: "gpt-4o",
		messages: [
			{
				role: "system",
				content: `You are a specialized parser that converts natural language descriptions of recurring schedules into structured patterns. Your task is to:

Current London time: ${formatLondonTime()}

1. Identify the core frequency (DAILY, WEEKLY, MONTHLY, YEARLY)
2. Determine the interval (e.g., every 2 weeks = interval: 2)
3. Extract any specific days, dates, or positions mentioned
4. Handle special cases like:
   - Month-end dates
   - Relative positions (e.g., "last Friday")
   - Multiple days or dates
   - Excluded dates
   - End conditions (specific end date or number of occurrences)

Rules:
- Always use the provided startDate without modification
- Set neverEnds to true unless an endDate or maxOccurrences is specified
- Include the original description in the response
- For month positions, only use FIRST, SECOND, THIRD, FOURTH, or LAST
- Days of week must be uppercase (MONDAY, TUESDAY, etc.)
- All dates must be in YYYY-MM-DD format
- Month numbers must be 1-12
- Day of month numbers must be 1-31

Here are examples of how to handle different recurring patterns:

1. Weekly on specific days:
Input: "every Monday and Wednesday"
{
  "frequency": "WEEKLY",
  "interval": 1,
  "startDate": "2024-03-15",
  "daysOfWeek": ["MONDAY", "WEDNESDAY"],
  "neverEnds": true,
  "description": "Every Monday and Wednesday."
}

2. Monthly on specific dates:
Input: "on the 1st and 15th of each month"
{
  "frequency": "MONTHLY",
  "interval": 1,
  "startDate": "2024-04-01",
  "dayOfMonth": [1, 15],
  "neverEnds": true,
  "description": "On the 1st and 15th of each month."
}

3. Monthly with position:
Input: "last Friday of every month"
{
  "frequency": "MONTHLY",
  "interval": 1,
  "startDate": "2024-03-29",
  "monthPosition": {
    "position": "LAST",
    "dayOfWeek": "FRIDAY"
  },
  "neverEnds": true,
  "description": "Last Friday of every month."
}

4. Monthly end of month:
Input: "on the last day of each month"
{
  "frequency": "MONTHLY",
  "interval": 1,
  "startDate": "2024-03-31",
  "monthEnd": true,
  "neverEnds": true,
  "description": "On the last day of each month."
}

5. Yearly with specific months:
Input: "January and September each year"
{
  "frequency": "YEARLY",
  "interval": 1,
  "startDate": "2024-01-01",
  "months": ["JANUARY", "SEPTEMBER"],
  "neverEnds": true,
  "description": "January and September each year."
}

6. Daily with weekday restriction:
Input: "every weekday"
{
  "frequency": "DAILY",
  "interval": 1,
  "startDate": "2024-03-12",
  "daysOfWeek": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  "neverEnds": true,
  "description": "Every weekday."
}

7. With end date:
Input: "weekly until December 31st"
{
  "frequency": "WEEKLY",
  "interval": 1,
  "startDate": "2024-03-15",
  "endDate": "2024-12-31",
  "description": "Weekly until December 31st."
}

8. With max occurrences:
Input: "every two weeks for 10 payments"
{
  "frequency": "WEEKLY",
  "interval": 2,
  "startDate": "2024-03-18",
  "maxOccurrences": 10,
  "description": "Every two weeks for 10 payments."
}

9. With excluded dates:
Input: "weekly on Mondays, skip March 25th and April 1st"
{
  "frequency": "WEEKLY",
  "interval": 1,
  "startDate": "2024-03-15",
  "daysOfWeek": ["MONDAY"],
  "neverEnds": true,
  "excludedDates": ["2024-03-25", "2024-04-01"],
  "description": "Weekly on Mondays, skip March 25th and April 1st."
}

10. Multiple months with specific days:
Input: "15th of March, June, September, and December"
{
  "frequency": "YEARLY",
  "interval": 1,
  "startDate": "2024-03-15",
  "months": ["MARCH", "JUNE", "SEPTEMBER", "DECEMBER"],
  "dayOfMonth": [15],
  "neverEnds": true,
  "description": "15th of March, June, September, and December."
}

11. First occurrence of month:
Input: "first Monday of every month"
{
  "frequency": "MONTHLY",
  "interval": 1,
  "startDate": "2024-04-01",
  "monthPosition": {
    "position": "FIRST",
    "dayOfWeek": "MONDAY"
  },
  "neverEnds": true,
  "description": "First Monday of every month."
}

12. Multiple days with interval:
Input: "every other week on Tuesday and Thursday"
{
  "frequency": "WEEKLY",
  "interval": 2,
  "startDate": "2024-03-12",
  "daysOfWeek": ["TUESDAY", "THURSDAY"],
  "neverEnds": true,
  "description": "Every other week on Tuesday and Thursday."
}

13. Specific weekdays with end date:
Input: "every Monday and Wednesday until June 30th"
{
  "frequency": "WEEKLY",
  "interval": 1,
  "startDate": "2024-03-13",
  "daysOfWeek": ["MONDAY", "WEDNESDAY"],
  "endDate": "2024-06-30",
  "description": "Every Monday and Wednesday until June 30th."
}

14. Monthly with multiple positions:
Input: "first and last Friday of every month"
{
  "frequency": "MONTHLY",
  "interval": 1,
  "startDate": "2024-03-01",
  "monthPosition": [
    {
      "position": "FIRST",
      "dayOfWeek": "FRIDAY"
    },
    {
      "position": "LAST",
      "dayOfWeek": "FRIDAY"
    }
  ],
  "neverEnds": true,
  "description": "First and last Friday of every month."
}

15. Complex yearly pattern:
Input: "first Monday of January, April, July, and October"
{
  "frequency": "YEARLY",
  "interval": 1,
  "startDate": "2024-01-01",
  "months": ["JANUARY", "APRIL", "JULY", "OCTOBER"],
  "monthPosition": {
    "position": "FIRST",
    "dayOfWeek": "MONDAY"
  },
  "neverEnds": true,
  "description": "First Monday of January, April, July, and October."
}

16. Position with excluded month:
Input: "every second tuesday of the month (except April)"
{
  "frequency": "MONTHLY",
  "interval": 1,
  "startDate": "2024-02-13",
  "monthPosition": {
    "position": "SECOND",
    "dayOfWeek": "TUESDAY"
  },
  "months": ["JANUARY", "FEBRUARY", "MARCH", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"],
  "neverEnds": true,
  "description": "Every second Tuesday of the month, except April."
}

The response must strictly conform to the schema provided.`,
			},
			{
				role: "user",
				content: `Description: "${description}"
Start date: "${startDate}"`,
			},
		],
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
	// Log all tool calls being made
	// console.log("\n=== Tool Calls Being Made ===");
	// for (const call of toolCalls) {
	// 	console.log("Tool:", call.function.name);
	// 	console.log("Arguments:", call.function.arguments);
	// }

	// Process all tool calls in parallel
	const toolCallPromises = toolCalls.map(async (toolCall) => {
		const args = JSON.parse(toolCall.function.arguments);

		switch (toolCall.function.name) {
			case "lookupCaseNumber": {
				const name = args.name;
				// We can safely use userID here since we check at the handler level
				const result = await lookupCaseNumber(name, userID);
				// console.log("\n=== Tool Response: lookupCaseNumber ===");
				// console.log("Query:", name);
				// console.log("Response:", JSON.stringify(result, null, 2));

				messages.push({
					role: "tool",
					content: JSON.stringify(result),
					tool_call_id: toolCall.id,
				});
				break;
			}
			case "searchBusinesses": {
				const name = args.name;
				// console.log("Current messages:", messages);
				const result = await searchBusinesses(name);
				// console.log("\n=== Tool Response: searchBusinesses ===");
				// console.log("Query:", name);
				// console.log("Response:", JSON.stringify(result, null, 2));

				messages.push({
					role: "tool",
					content: JSON.stringify(result),
					tool_call_id: toolCall.id,
				});
				break;
			}
			case "parseRecurring": {
				const { description, startDate } = args;
				const result = await parseRecurring(description, startDate);
				// console.log("\n=== Tool Response: parseRecurring ===");
				// console.log("Description:", description);
				// console.log("Start Date:", startDate);
				// console.log("Response:", JSON.stringify(result, null, 2));

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
	// console.log("\n=== All Tool Calls Completed ===\n");
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
		// console.log("messages after tool call: ", messages);

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

	// Process the form data based on expense type
	const initialFormData = llmMessage.parsed?.form || null;
	// console.log("LLM parsed form data:", JSON.stringify(initialFormData, null, 2));
	// console.log("Current form state:", JSON.stringify(currentFormState, null, 2));

	// Ensure we're handling both expense types correctly
	const formData = initialFormData
		? {
				...initialFormData,
				// Make sure we preserve the expense type
				expenseType: initialFormData.expenseType || currentFormState.expenseType,
				// Ensure we have the appropriate fields based on expense type
				...(initialFormData.expenseType === "PURCHASE_ORDER" || currentFormState.expenseType === "PURCHASE_ORDER"
					? {
							businessDetails: initialFormData.businessDetails || currentFormState.businessDetails,
						}
					: {
							recipientDetails: initialFormData.recipientDetails || currentFormState.recipientDetails,
						}),
			}
		: null;

	// Set default end date for recurring patterns with neverEnds: false but no end conditions
	if (formData?.isRecurring && formData?.recurrencePattern && !formData.recurrencePattern.neverEnds) {
		if (!formData.recurrencePattern.endDate && !formData.recurrencePattern.maxOccurrences) {
			// Get current date and add one year
			const startDate = new Date(formData.recurrencePattern.startDate);
			const oneYearFromStart = new Date(startDate);
			oneYearFromStart.setFullYear(oneYearFromStart.getFullYear() + 1);

			// Format as YYYY-MM-DD
			formData.recurrencePattern.endDate = oneYearFromStart.toISOString().split("T")[0];
		}
	}

	// console.log("Processed form data to return:", JSON.stringify(formData, null, 2));

	// Check for any null or undefined fields that might cause issues
	if (formData) {
		const nullFields = Object.entries(formData)
			.filter(([_, value]) => value === null || value === undefined)
			.map(([key]) => key);

		if (nullFields.length > 0) {
			console.warn("Warning: Form contains null/undefined fields:", nullFields);
		}

		// Ensure required fields are present
		const requiredFields = ["title", "caseNumber", "amount", "reason", "dateRequired"];
		const missingFields = requiredFields.filter((field) => !(field in formData));

		if (missingFields.length > 0) {
			console.warn("Warning: Form is missing required fields:", missingFields);
		}
	}

	// Return messages and parsed form data
	return {
		messages,
		formData,
		followUp: llmMessage.parsed?.followUp ? JSON.parse(JSON.stringify(llmMessage.parsed.followUp)) : null,
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
	try {
		// Query the User model using the profileOwner field which contains the sub ID
		const { data: users, errors } = await client.models.User.list({
			// @ts-ignore - The type definitions don't match the actual API
			filter: { profileOwner: { beginsWith: userID } },
			limit: 1,
		});

		if (errors) {
			console.error("Error querying User model:", errors);
			return null;
		}

		const userData = users?.[0];
		// console.log("Found user data:", userData);

		if (!userData) {
			console.warn("No user found with ID:", userID);
			return null;
		}

		return {
			name: `${userData.firstName} ${userData.lastName}`,
			// This will never work as we aren't storing User address
			address: {
				line1: userData.address?.lineOne || "123 Fake St",
				townOrCity: userData.address?.townOrCity || "London",
				postcode: userData.address?.postcode || "SW1A 1AA",
			},
		};
	} catch (error) {
		console.error("Error fetching user details:", error);
		return null;
	}
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
	// console.log("event identity: ", event.identity);
	const userIdFromIdentity = (event.identity as { sub: string }).sub;
	// console.log("Handler started with userID:", userIdFromIdentity);
	// console.log("Event arguments:", JSON.stringify(event.arguments, null, 2));

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
	// console.log("Form ID from arguments:", formID);
	// console.log("Current form state from arguments:", currentFormState);

	// Parse the messages from the request
	const messagesJSON = JSON.parse(messages ?? "[]");
	const currentFormStateJSON = JSON.parse(currentFormState ?? "{}");
	// console.log("Parsed current form state:", JSON.stringify(currentFormStateJSON, null, 2));

	// Check if first message is a system message
	let messagesWithSystem = messagesJSON;
	if (!messagesJSON.length || messagesJSON[0].role !== "system") {
		// Only fetch user details if we need to create a system message
		const userDetails = await getUserDetails(userIdFromIdentity);

		const systemMessage = {
			role: "system" as const,
			content: `# Norm: Assistant for Expense Requests

You are Norm, a friendly and efficient assistant designed to help social workers at Hounslow Council in London fill out expense requests. You fill out the structured form on their behalf based on a natural-language conversation.

Your primary goal is to gather information step-by-step to fully complete each required form field.

Try to ask just one clear, friendly question at a time so the process is simple for the social worker.

Social worker details:
* Name: ${userDetails?.name}
* Address: ${userDetails?.address?.line1}, ${userDetails?.address?.townOrCity}, ${userDetails?.address?.postcode}

London time: ${formatLondonTime()}

## Expense Types

There are two expense types: 

1. Prepaid cards - for providing funds directly to recipients via a prepaid card
2. Purchase orders - for purchasing directly from a business

* Forms default to PREPAID_CARD as this is most common. You must change it to PURCHASE_ORDER when appropriate.
* It is important to identify the expense type early in the conversation and set expenseType accordingly.

## Common Fields

Common fields for both expense types:
* form:
  * title (short, descriptive summary of the request)
  * caseNumber
  * reason (reason for the expense)
  * section17
  * amount (numeric, no currency symbols)
  * dateRequired (date prepaid card or one-off purchase order or first of recurring purchase order is required by):
    * day
    * month
    * year
  * expenseType (PREPAID_CARD or PURCHASE_ORDER)
  * isRecurring (boolean, indicates if this is a recurring payment)
  * recurrencePattern (optional, required if isRecurring is true)
* followUp

## Case Number

* The caseNumber is unique to each child.
* Social workers are more likely to know a child's name than case number, so only have them type the case number when absolutely necessary.
* Use the lookupCaseNumber tool to lookup a child's case number using just their name.
* If the social worker provides the child's name, immediately use the lookupCaseNumber tool and fill out the caseNumber.
* Never ask something like "What is the case number for Charlie Bucket?" without first using the lookupCaseNumber tool.
* The first time the Child's name is mentioned, immediately use the tool to lookup their case number and fill out that field. Never tell the user you are going to lookup the case number, just do it.

## Title

* You must generate a short, descriptive title summarising the expense request.
* Update the title immediately upon understanding the primary purpose of the request.
* Alter the title if further information enables you to improve it.
* The title will be used to identify this form among the list of every form the social worker has submitted.
* Examples: "School uniform for Alex", "Drugs test for Charlie"

## Section 17

* Section 17 expense requests are special and are flagged as urgent in the system.
* Never ask if the expense should be marked as section 17.
* Only mark an expense as section 17 if the social worker explicitly requests it.

## Follow-Up

* To ask the social worker a follow-up question, include the question in the followUp field.

## Prepaid Cards

* With prepaid cards, money is loaded onto a card and it is given to the recipient so they can make the purchase.
* Usually the recipient is the social worker themselves, but sometimes it will be someone else (eg parent, carer) - rarely will the child be the recipient.
* Never assume the recipient. If it isn't obvious, ask the social worker who the prepaid card should be issued to.
* If the social worker states they are the recipient, immediately auto-fill their details using the provided social worker info.
* Prepaid card expenses cannot be recurring.
* Prepaid card additional fields:
  * recipientDetails:
    * name:
      * firstName
      * lastName
    * address:
      * lineOne
      * lineTwo (optional)
      * townOrCity
      * postcode

### Example 1: Social worker as recipient

User: "I need a prepaid card for £50 to buy school supplies for Emily Smith by March 25th."

[Tool call: lookupCaseNumber("Emily Smith")]  
[Tool response: {"id": "12345", "firstName": "Emily", "lastName": "Smith", "dateOfBirth": "2015-03-10"}]

Response:
{
  "form": {
    "title": "School supplies for Emily Smith",
    "expenseType": "PREPAID_CARD",
    "caseNumber": "12345",
    "reason": "Purchase of school supplies",
    "amount": 50,
    "dateRequired": { "day": 25, "month": 3, "year": 2025 },
    "isRecurring": false,
    "recipientDetails": {
      "name": { "firstName": "Matt", "lastName": "Stanbrell" }, // Social worker's details
      "address": { 
        "lineOne": "123 Fake Street",
        "lineTwo": "",
        "townOrCity": "London", 
        "postcode": "SW1A 1AA" 
      }
    }
  },
  "followUp": "I've filled in the form for a £50 prepaid card for Emily Smith's school supplies. The card will be issued to you and the request is set for March 25th, 2025. Is there anything else you need for this request?"
}

### Example 2: Parent as recipient

User: "I need to arrange a £75 prepaid card for Jenny Taylor's mother to buy winter clothing."

[Tool call: lookupCaseNumber("Jenny Taylor")]  
[Tool response: {"id": "67890", "firstName": "Jenny", "lastName": "Taylor", "dateOfBirth": "2017-09-22"}]

Response:
{
  "form": {
    "title": "Winter clothing for Jenny Taylor",
    "expenseType": "PREPAID_CARD",
    "caseNumber": "67890",
    "reason": "Winter clothing purchase",
    "amount": 75,
    "dateRequired": { "day": null, "month": null, "year": null },
    "isRecurring": false,
    "recipientDetails": {
      "name": { "firstName": "", "lastName": "" },
      "address": { 
        "lineOne": "",
        "lineTwo": "",
        "townOrCity": "", 
        "postcode": "" 
      }
    }
  },
  "followUp": "What is Jenny's mother's full name and address for the prepaid card?"
}

## Purchase Orders

* With purchase orders, the payment is made directly to the business.
* You can use the searchBusinesses tool to search the council's database for businesses they have used before. This tool takes a business name as the sole argument and may return one or more businesses with name, address, and ID.
* If the search yields one result, ask the social worker to confirm it.
* If the search yields multiple results, present them to the social worker and ask them to select the correct one.
* If the search tool doesn't yield a result, you must ask the social worker for the business address.
* If the business is found using the tool, fill out the businessID field. If the business isn't found using the tool, leave the businessID blank - don't make one up!
* Purchase orders can be recurring.
* Purchase order additional fields:
  * businessDetails:
    * name
    * address:
      * lineOne
      * lineTwo (optional)
      * townOrCity
      * postcode
  * businessID (only if an existing business is selected from the database)
  * isRecurring
  * recurrencePattern

### Example 1: One-time purchase with existing business (with confirmation)

User: "I need to order school books from BookWorld for Jamie Green's class. It will cost £120 and we need them by April 10th."

Tool calls (both made together in the same response):
1. lookupCaseNumber("Jamie Green")
2. searchBusinesses("BookWorld")

After receiving tool responses:
- lookupCaseNumber returns: {"id": "34521", "firstName": "Jamie", "lastName": "Green", "dateOfBirth": "2016-07-22"}
- searchBusinesses returns: [{"id": "b78901", "name": "BookWorld Ltd", "address": {"lineOne": "45 Reader Lane", "lineTwo": "", "townOrCity": "London", "postcode": "E14 9WR"}}]

Final response:
{
  "form": {
    "title": "School books from BookWorld for Jamie Green",
    "expenseType": "PURCHASE_ORDER",
    "caseNumber": "34521",
    "reason": "School books for class",
    "amount": 120,
    "dateRequired": { "day": 10, "month": 4, "year": 2025 },
    "isRecurring": false
  },
  "followUp": "I found BookWorld Ltd (45 Reader Lane, London, E14 9WR) in our system. Is this the correct business you want to place the order with?"
}

### Example 2: Recurring purchase with existing business

User: "I need to set up monthly payments of £85 to ABC Therapy Services for Daniel Wilson's speech therapy."

Tool calls (both made together in the same response):
1. lookupCaseNumber("Daniel Wilson")
2. searchBusinesses("ABC Therapy Services")

After receiving tool responses:
- lookupCaseNumber returns: {"id": "56789", "firstName": "Daniel", "lastName": "Wilson", "dateOfBirth": "2018-03-15"}
- searchBusinesses returns: [{"id": "b23456", "name": "ABC Therapy Services", "address": {"lineOne": "123 Health Street", "lineTwo": "Suite 4B", "townOrCity": "London", "postcode": "NW1 6QT"}}]

First response:
{
  "form": {
    "title": "Monthly speech therapy from ABC Therapy Services for Daniel Wilson",
    "expenseType": "PURCHASE_ORDER",
    "caseNumber": "56789",
    "reason": "Speech therapy sessions",
    "amount": 85,
    "businessDetails": {
      "name": "ABC Therapy Services",
      "address": {
        "lineOne": "123 Health Street",
        "lineTwo": "Suite 4B",
        "townOrCity": "London",
        "postcode": "NW1 6QT"
      }
    },
    "businessID": "b23456",
    "isRecurring": true
  },
  "followUp": "I've found ABC Therapy Services in our system. When would you like the monthly payments to start?"
}

User: "April 5th"

[Tool call: parseRecurring("monthly payments starting April 5th", "2025-04-05")]  
[Tool response: {
  "frequency": "MONTHLY",
  "interval": 1,
  "startDate": "2025-04-05",
  "neverEnds": true,
  "description": "Monthly payments starting April 5th."
}]

Final response:
{
  "form": {
    "title": "Monthly speech therapy from ABC Therapy Services for Daniel Wilson",
    "expenseType": "PURCHASE_ORDER",
    "caseNumber": "56789",
    "reason": "Speech therapy sessions",
    "amount": 85,
    "dateRequired": { "day": 5, "month": 4, "year": 2025 },
    "businessDetails": {
      "name": "ABC Therapy Services",
      "address": {
        "lineOne": "123 Health Street",
        "lineTwo": "Suite 4B",
        "townOrCity": "London",
        "postcode": "NW1 6QT"
      }
    },
    "businessID": "b23456",
    "isRecurring": true,
    "recurrencePattern": {
      "frequency": "MONTHLY",
      "interval": 1,
      "startDate": "2025-04-05",
      "neverEnds": true,
      "description": "Monthly payments starting April 5th."
    }
  },
  "followUp": "I've set up monthly recurring payments of £85 to ABC Therapy Services for Daniel's speech therapy, starting April 5th, 2025. Is there anything else you need to add to this purchase order?"
}

### Example 3: Multiple search results

User: "I need to order £250 of furniture from Furniture World for Sophia Lee by May 15th."

Tool calls (both made together in the same response):
1. lookupCaseNumber("Sophia Lee")
2. searchBusinesses("Furniture World")

After receiving tool responses:
- lookupCaseNumber returns: {"id": "78123", "firstName": "Sophia", "lastName": "Lee", "dateOfBirth": "2014-10-05"}
- searchBusinesses returns: [
  {"id": "b34567", "name": "Furniture World - East London", "address": {"lineOne": "87 Commerce Road", "lineTwo": "Industrial Estate", "townOrCity": "London", "postcode": "E3 4TG"}},
  {"id": "b34568", "name": "Furniture World - North London", "address": {"lineOne": "23 Home Avenue", "lineTwo": "", "townOrCity": "London", "postcode": "N17 7QP"}}
]

Final response:
{
  "form": {
    "title": "Furniture purchase for Sophia Lee",
    "expenseType": "PURCHASE_ORDER",
    "caseNumber": "78123",
    "reason": "Furniture purchase",
    "amount": 250,
    "dateRequired": { "day": 15, "month": 5, "year": 2025 },
    "isRecurring": false
  },
  "followUp": "I found two branches of Furniture World in our system. Which one would you like to use for this order?\n1) Furniture World - East London (87 Commerce Road, Industrial Estate, London, E3 4TG)\n2) Furniture World - North London (23 Home Avenue, London, N17 7QP)"
}

### Example 4: Business not found

User: "I need to place a purchase order for £175 with Rainbow Educational Supplies for art materials for Oliver Brown's school project. We need them by March 30th."

Tool calls (both made together in the same response):
1. lookupCaseNumber("Oliver Brown")
2. searchBusinesses("Rainbow Educational Supplies")

After receiving tool responses:
- lookupCaseNumber returns: {"id": "45678", "firstName": "Oliver", "lastName": "Brown", "dateOfBirth": "2015-05-18"}
- searchBusinesses returns: {"message": "No businesses found matching \"Rainbow Educational Supplies\""}


Final response:
{
  "form": {
    "title": "Art materials from Rainbow Educational Supplies for Oliver Brown",
    "expenseType": "PURCHASE_ORDER",
    "caseNumber": "45678",
    "reason": "Art materials for school project",
    "amount": 175,
    "dateRequired": { "day": 30, "month": 3, "year": 2025 },
    "isRecurring": false,
    "businessDetails": {
      "name": "Rainbow Educational Supplies",
      "address": {
        "lineOne": "",
        "lineTwo": "",
        "townOrCity": "",
        "postcode": ""
      }
    }
  },
  "followUp": "I couldn't find Rainbow Educational Supplies in our system. Could you please provide their address details?"
}

## Recurring Payments

* Purchase orders (not prepaid cards) can be recurring.
* If the social worker mentions any recurring schedule (eg, "every week", "monthly", "twice a month"), set isRecurring to true.
* Use the parseRecurring tool to convert a natural language recurrence description into a recurrencePattern. Then include this recurrencePattern in the form response.
* parseRecurring takes two arguments: description and startDate.
* The description should include ALL relevant information about the recurrence pattern, including any exclusions or exceptions.
* For startDate:
  * If a clear date is provided (eg, "March 15th", "next Tuesday", "first Monday of April"), use it directly.
  * If the date is unclear or missing (eg, "soon", "in a few days", or no date mentioned), ALWAYS ask for one before calling the parseRecurring tool.
  * Format all dates as YYYY-MM-DD.
* When filling out the recurrencePattern field, always include the start date in your response, eg "I've set up weekly payments starting from March 15th, 2024."
* If the recurrence description is unclear, ask clarifying questions before calling the parseRecurring tool.

Supported recurrence patterns:
* Frequency types: daily, weekly, monthly, or yearly
* Intervals: "every X days/weeks/months/years" where X is a number (e.g., every 2 weeks)
* Weekly patterns: can specify particular days (e.g., every Monday and Wednesday)
* Monthly patterns: 
  * Specific dates (e.g., 1st and 15th of each month)
  * Relative positions (e.g., first Monday, last Friday of the month)
  * Month-end option for last day regardless of date
  * Can include or exclude specific months (e.g., every second Tuesday except in April)
* Yearly patterns:
  * Specific months (e.g., January and July each year)
  * Can combine with specific dates or relative positions (e.g., first Monday of January)
  * Can select a subset of months for the pattern to apply (e.g., only in Q1 months)
* End conditions: can specify an endDate, maxOccurrences, or neverEnds
* Exclusions: 
  * Can specify dates to skip
  * Can exclude specific months from monthly or yearly patterns
  * Can create sophisticated patterns like "second Tuesday of every month except April"

Always ask clarifying questions when:
* The frequency is unclear (daily, weekly, monthly, yearly)
* For weekly patterns, which specific days are needed (if applicable)
* For monthly patterns, whether it's specific dates or relative positions
* Whether there's an endDate or maxOccurrences
* Whether any dates should be excluded

Explain limitations if the social worker requests:
* Complex patterns like "every other day except weekends"
* Patterns based on fiscal periods or holidays
* Patterns with irregular frequencies

## Tools

### Available Tools

* lookupCaseNumber(name: string): look up a child's case number using their name.
* searchBusinesses(name: string): search for a business by name.
* parseRecurring(description: string, startDate: string): convert natural language description of a recurring payment schedule into structured recurrencePattern.

### Guidelines

* When calling a tool, leave the followUp field blank as the social worker won't see it anyway.
* Where possible, call multiple tools in a single message (eg lookupCaseNumber and searchBusinesses).

## Manual Editing

* Social workers may manually edit form fields between messages.
* Always respect these edits.
* Only update manually edited fields if the social worker provides new, explicit information that directly contradicts or replaces them.

## General Guidelines

* Never guess or invent missing details - politely ask the social worker for clarification whenever information is unclear or incomplete.
* Use correct grammar and punctuation in form fields.
* Immediately update fields when relevant information is received.
* Identify the expenseType and caseNumber as soon as possible.
* Try to ask just one question at a time.
* Use tools first before falling back on asking the social worker.
* Be friendly and efficient. 
* Address the social worker by their first name where appropriate.
* Your only role is to fill out the form for the social worker, you cannot submit the form, do not offer any services beyond simply filling out the form.
`,
		};
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

	// console.log("Result from processLLMResponse:", {
	// 	followUp: result.followUp,
	// 	formData: JSON.stringify(result.formData, null, 2),
	// 	messagesLength: result.messages.length,
	// });

	const conversationUpdatePromise = client.models.NormConversation.update({
		id: conversationId,
		messages: JSON.stringify(result.messages),
	});

	// console.log("About to update form with data:", JSON.stringify(result.formData, null, 2));
	// console.log("Form ID for update:", formID);

	// Ensure we have a valid form ID before attempting an update
	if (!formID) {
		console.error("No form ID provided for update");
	}

	// Check if we have form data to update
	const hasFormData = result.formData && Object.keys(result.formData).length > 0;
	// console.log("Has form data to update:", hasFormData);

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

						// console.log("Sending form update with data:", JSON.stringify(updateData, null, 2));

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
		// console.log("Starting Promise.all for conversation and form updates");
		const [conversationResult, formResult] = await Promise.all([conversationUpdatePromise, formUpdatePromise]);
		// console.log("Conversation update result:", JSON.stringify(conversationResult, null, 2));
		// console.log("Form update result:", {
		// 	data: formResult.data ? "Data present" : "No data",
		// 	dataType: formResult.data ? typeof formResult.data : "N/A",
		// 	dataKeys: formResult.data ? Object.keys(formResult.data) : [],
		// 	errors: formResult.errors,
		// });

		if (formResult.errors) {
			console.error("Form update errors:", JSON.stringify(formResult.errors, null, 2));
		}

		// Get the updated form data
		const updatedForm = formResult.data || currentFormStateJSON;
		// console.log("Final updatedForm type:", typeof updatedForm);
		// console.log("Final updatedForm keys:", Object.keys(updatedForm));
		// console.log("Final updatedForm:", JSON.stringify(updatedForm, null, 2));

		// Check if updatedForm is empty or missing expected fields
		if (!updatedForm || Object.keys(updatedForm).length === 0) {
			console.warn("Warning: updatedForm is empty or null, using currentFormStateJSON as fallback");
			// Use the original form state as a fallback
			const fallbackForm = currentFormStateJSON;
			// console.log("Fallback form:", JSON.stringify(fallbackForm, null, 2));
		}

		// Ensure we're returning a valid form state
		const finalFormState = typeof updatedForm === "string" ? updatedForm : JSON.stringify(updatedForm);

		// console.log("Final form state to return:", finalFormState);

		// console.log("event identity: ", event.identity);

		// Return the conversation ID and a simple follow-up message
		return {
			followUp: result.followUp ? result.followUp.replace(/\\/g, "") : null,
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
