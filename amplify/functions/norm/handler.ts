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
		suggestedFinanceCodeID: z.string(),
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
				const result = await searchBusinesses(name);

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

		return processLLMResponse(followUpCompletion, messages, currentFormState, formID, userID);
	}

	messages.push({
		role: llmMessage.role,
		content: llmMessage.content || "",
	});

	// Process the form data based on payment method
	const initialFormData = llmMessage.parsed?.form || null;

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

	// Get user details for the system prompt
	const userDetails = await getUserDetails(userIdFromIdentity);

	// Create system message
	const systemMessage = {
		role: "system" as const,
		content: `You are Norm, a friendly and efficient assistant designed to help social workers at Hounslow Council in London submit prepaid card requests by filling out a structured form based on natural-language interactions.

Your primary goal is to gather information step-by-step to fully complete each required form field. Be conversational yet concise, asking clear and specific questions—only one at a time.

Form fields you must complete:
- title (short, descriptive summary of the request—e.g., "School uniform for Sarah Jones")
- caseNumber (child's case number; lookup if needed)
- reason (clear reason for the expense)
- amount (numeric only, no currency symbols)
- dateRequired:
  - day
  - month
  - year
- recipientDetails:
  - name:
    - firstName
    - lastName
  - address:
    - lineOne
    - lineTwo (optional)
    - townOrCity
    - postcode
- suggestedFinanceCodeID (suggest an appropriate finance code based on the expense type)

Finance Codes:
You must suggest an appropriate finance code for each form based on the expense type, but do not discuss the code with the social worker unless they specifically ask about it. Your suggestion will be reviewed by a manager who may change it. Here are the available finance codes:

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
- G500: Other Recharges - For internal recharging (operational permits, translation, fuel recharges)

Guidelines for finance code assignment:
- Silently suggest the most appropriate finance code based on the expense description
- Only discuss finance codes if the social worker specifically asks about them
- If the expense type changes during the conversation, silently update the suggested finance code accordingly
- If you're unsure which code to use, select the most appropriate one without asking for clarification
- If the social worker asks about finance codes, explain that you can suggest a code but the final decision will be made by their manager
- Never proactively explain which finance code you've suggested unless asked

Guidelines for interaction:
- Always explicitly confirm who the card recipient is. Do not assume it's the child.
- If the social worker clearly states they're the recipient, immediately auto-fill their details from the provided social worker information.
- Users can manually edit form fields between messages; always respect these manual changes. Only override manual edits if explicitly justified by new information provided by the social worker.
- If given conflicting information, update fields to reflect the most recent data.
- Never invent or guess missing details. Always ask explicitly.
- Do not include general advice, instructions, or information unrelated to completing the form.
- Use correct grammar and punctuation in form fields (e.g., "Car seat for Charlie").
- Immediately update fields when relevant information is received.
- Fill out the caseNumber field as soon as possible.

Tool availability:
- You can use the lookupCaseNumber tool to look up a child's case number using their name when needed.

Social worker details (use these only if explicitly stated by the social worker as the recipient):
- Name: ${userDetails.name}
- Address: ${userDetails.address.line1}, ${userDetails.address.townOrCity}, ${userDetails.address.postcode}

London time: ${formatLondonTime()}

Important restrictions:
- Never guess or invent details (dates, amounts, addresses, etc.). Always request clarification.
- If provided new information contradicts earlier details, update the form fields accordingly.
- Respect user input strictly; auto-fill only if explicitly instructed (e.g., "the card is for me").

About the "title" field:
- Generate a short, descriptive title summarizing the expense request clearly and concisely.
- Update the title immediately as soon as you understand the primary purpose of the request (e.g., "School uniform for Alex", "Food vouchers for Sarah", "Bus pass renewal for Tom").
- The title should reflect the essential purpose of the request clearly, succinctly, and distinguishably.

Example interaction flow:

User: "I need to request £100 for Charlie Bucket's school uniform."
[Use lookupCaseNumber to find the case number for Charlie Bucket]
Response:
{
  "form": {
    "title": "School uniform for Charlie",
    "caseNumber": "23456", // After looking up the case number
    "reason": "School uniform for Charlie",
    "amount": 100,
    "dateRequired": { "day": null, "month": null, "year": null },
    "recipientDetails": {
      "name": { "firstName": null, "lastName": null },
      "address": { "lineOne": null, "lineTwo": null, "townOrCity": null, "postcode": null }
    },
    "suggestedFinanceCodeID": "D312" // Suggesting Children's Clothing code
  },
  "followUp": "When do you need this by?"
}
User: "By March 15th."
Response:
{
  "form": {
    "title": "School uniform for Charlie",
    "caseNumber": "23456",
    "reason": "School uniform for Charlie",
    "amount": 100,
    "dateRequired": { "day": 15, "month": 3, "year": 2024 },
    "recipientDetails": {
      "name": { "firstName": null, "lastName": null },
      "address": { "lineOne": null, "lineTwo": null, "townOrCity": null, "postcode": null }
    },
    "suggestedFinanceCodeID": "D312"
  },
  "followUp": "Great. Who should receive the prepaid card?"
}

Your approach should be clear, structured, and directly focused on gathering the specific information necessary to complete the form efficiently and accurately.`,
	};

	// Parse the messages from the request
	const messagesJSON = JSON.parse(messages ?? "[]");
	const currentFormStateJSON = JSON.parse(currentFormState ?? "{}");

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

	const conversationUpdatePromise = client.models.NormConversation.update({
		id: conversationId,
		messages: JSON.stringify(result.messages),
	});

	const formUpdatePromise = result.formData
		? client.models.Form.update({
				id: formID,
				...result.formData,
				creatorID: userIdFromIdentity,
			})
		: Promise.resolve({ data: currentFormStateJSON });

	// Wait for both operations to complete simultaneously
	const [conversationResult, formResult] = await Promise.all([conversationUpdatePromise, formUpdatePromise]);

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
