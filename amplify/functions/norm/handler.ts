import type { Schema } from "../../data/resource";
// import { ChatOpenAI } from "@langchain/openai";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatAnthropic } from "@langchain/anthropic";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Annotation, MessagesAnnotation, Command } from "@langchain/langgraph";
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";

// const formSchema = z.object({
// 	socialWorkerEmail: z.string(),
// 	caseNumber: z.number(),
// 	reason: z.string(),
// 	amount: z.string(),
// 	dateRequired: z.string(),
// 	firstName: z.string(),
// 	lastName: z.string(),
// 	addressLine1: z.string(),
// 	addressLine2: z.string(),
// 	addressTown: z.string(),
// 	postcode: z.string(),
// 	category: z.string(),
// });

const dummyChildData = [
	{
		name: "Charlie Bucket",
		caseNumber: "12345",
		age: 10,
	},
	{
		name: "Violet Beauregarde",
		caseNumber: "12346",
		age: 11,
	},
	{
		name: "Augustus Gloop",
		caseNumber: "12347",
		age: 9,
	},
	{
		name: "Veruca Salt",
		caseNumber: "12348",
		age: 12,
	},
	{
		name: "Mike Teavee",
		caseNumber: "12349",
		age: 10,
	},
];

// We know the social worker info from the auth
const socialWorker = {
	name: "Matt Stanbrell",
	email: "matt@critcal.com",
	cases: ["12345", "12346", "12347", "12348", "12349"],
	address: {
		line1: "123 Fake Street",
		town: "London",
		postcode: "SW1A 1AA",
	},
};

type FormState = {
	caseNumber?: string;
	reason?: string;
	amount?: number;
	dateRequired?: {
		day: number;
		month: number;
		year: number;
	};
	firstName?: string;
	lastName?: string;
	address?: {
		line1: string;
		line2: string;
		town: string;
		postcode: string;
	};
};

// Module-level form state
let currentFormState: FormState = {};

const lookupCaseNumberByChildName = tool(
	async ({
		childName,
	}: {
		childName: string;
	}) => {
		console.log("\n=== lookupCaseNumberByChildName called ===");
		console.log("Looking up:", childName);

		const searchName = childName.toLowerCase();
		console.log("Normalized search name:", searchName);

		// Filter cases that belong to the social worker
		const availableCases = dummyChildData.filter((child) =>
			socialWorker.cases.includes(child.caseNumber),
		);
		console.log("Available cases:", availableCases);

		// Look for exact matches (case-insensitive)
		const exactMatches = availableCases.filter(
			(child) => child.name.toLowerCase() === searchName,
		);
		console.log("Exact matches found:", exactMatches);

		let result: {
			status: "exact_match" | "multiple_matches" | "no_exact_match";
			caseNumber?: string;
			message: string;
			matches?: typeof exactMatches;
			availableCases?: typeof availableCases;
			searchTerm?: string;
		};

		if (exactMatches.length === 1) {
			result = {
				status: "exact_match",
				caseNumber: exactMatches[0].caseNumber,
				message: `Found case number ${exactMatches[0].caseNumber} for ${exactMatches[0].name}. Proceed with using this case number.`,
			};
		} else if (exactMatches.length > 1) {
			const matchesText = exactMatches
				.map(
					(child) =>
						`- ${child.name} (Case ${child.caseNumber}, Age ${child.age})`,
				)
				.join("\n");
			result = {
				status: "multiple_matches",
				matches: exactMatches,
				message: `Multiple exact matches found. Ask the user to specify which child they are referring to from the following list:\n${matchesText}`,
			};
		} else {
			const casesText = availableCases
				.map(
					(child) =>
						`- ${child.name} (Case ${child.caseNumber}, Age ${child.age})`,
				)
				.join("\n");
			result = {
				status: "no_exact_match",
				availableCases: availableCases,
				searchTerm: childName,
				message: `No exact match found for "${childName}". Here are all available cases:\n${casesText}\n\nPlease:\n1. Check if any names are similar to "${childName}" (e.g. nicknames, partial matches, misspellings)\n2. If you find similar names, ask the user "Did you mean one of these?" and show only those matches\n3. If no similar names found, show the full list and ask the user to specify which child they mean`,
			};
		}

		console.log("Returning result:", result);
		return result;
	},
	{
		name: "lookupCaseNumberByChildName",
		description:
			"Look up a child's case number by their name. Returns exact matches if found, otherwise returns all cases for the agent to analyze.",
		schema: z.object({
			childName: z.string().describe("The name of the child to look up"),
		}),
	},
);

const updateFormFields = tool(
	async ({
		updates,
	}: {
		updates: Array<{
			field: string;
			value: string;
			type: "string" | "number";
		}>;
	}) => {
		console.log("\n=== updateFormFields called ===");
		console.log(
			"Current form state:",
			JSON.stringify(currentFormState, null, 2),
		);
		console.log("Requested updates:", updates);

		// Helper to update nested fields
		const updateNestedField = (
			path: string[],
			value: string,
			type: "string" | "number",
		) => {
			console.log(`Updating field: ${path.join(".")} to ${value} (${type})`);
			const lastKey = path[path.length - 1];
			let pointer: Record<string, unknown> = currentFormState;

			// Navigate to the correct nesting level
			for (let i = 0; i < path.length - 1; i++) {
				const key = path[i];
				if (!(key in pointer)) {
					pointer[key] = {};
				}
				pointer = pointer[key] as Record<string, unknown>;
			}

			// Update the value with proper type conversion
			// Special case for caseNumber - always treat as string
			if (lastKey === "caseNumber") {
				pointer[lastKey] = value;
			} else {
				pointer[lastKey] = type === "number" ? Number(value) : value;
			}
		};

		// Apply all updates in sequence
		for (const { field, value, type } of updates) {
			const fieldParts = field.split(".");
			updateNestedField(fieldParts, value, type);
		}

		console.log(
			"Updated form state:",
			JSON.stringify(currentFormState, null, 2),
		);

		const response = `Updated fields: ${updates
			.map(({ field, value }) => `${field} to ${value}`)
			.join(", ")}`;
		console.log("Returning response:", response);
		return response;
	},
	{
		name: "updateFormFields",
		description: "Update multiple fields in the form at once.",
		schema: z.object({
			updates: z
				.array(
					z.object({
						field: z
							.string()
							.describe(
								"The field name to update. Can be nested using dot notation (e.g. 'address.line1' or 'dateRequired.day').",
							),
						value: z.string().describe("The new value for the field."),
						type: z
							.enum(["string", "number"])
							.describe(
								"The type of the field - use 'number' for amount and all dateRequired fields. Use 'string' for everything else including caseNumber.",
							),
					}),
				)
				.describe("Array of field updates to apply"),
		}),
	},
);

// const model = new ChatOpenAI({
// 	model: "gpt-4o", // DON'T CHANGE THIS
// 	apiKey: process.env.OPENAI_API_KEY,
// });

// const model = new ChatGoogleGenerativeAI({
// 	model: "gemini-2.0-flash", // DON'T CHANGE THIS
// 	apiKey: process.env.GOOGLE_API_KEY,
// });

const model = new ChatAnthropic({
	model: "claude-3-5-sonnet-latest", // DON'T CHANGE THIS
	apiKey: process.env.ANTHROPIC_API_KEY,
});

// Add this before the agent creation
const formatLondonTime = () => {
	const now = new Date();
	return new Intl.DateTimeFormat("en-GB", {
		timeZone: "Europe/London",
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(now);
};

const agent = createReactAgent({
	llm: model,
	tools: [updateFormFields, lookupCaseNumberByChildName],
	stateModifier: `You are an intelligent assistant helping social workers submit prepaid card requests quickly and efficiently. You help fill out a form based on their natural language requests, while being aware of any manual edits they make to the form fields between messages.

Current time in London: ${formatLondonTime()}

Current social worker details (use these to auto-fill fields if they are the card recipient):
Name: ${socialWorker.name}
Address: ${socialWorker.address.line1}
Town: ${socialWorker.address.town}
Postcode: ${socialWorker.address.postcode}

Key points:
- Each request needs a case number (use lookupCaseNumberByChildName if given a child's name)
- Social workers can manually edit form fields between messages - you'll receive a note about any changes
- The prepaid card recipient's name and address must be specified
- Only update fields that have new information - don't resend unchanged values
- Keep responses friendly but concise, asking for only 1-2 pieces of information at a time
- Use proper grammar and capitalization in all fields
- The expense might not be directly for a child, but still needs a case number
- Social workers often remember children's names better than case numbers

When handling a request:
1. Check existing form values and any notes about manual edits
2. Extract any new information from the message
3. ONLY update fields that should change based on new information
4. If no case number, ask for a child's name or case number
5. If recipient unclear, ask if card should go to the social worker
6. If they say the card is for them, auto-fill their details (but only if not already set)

Using the updateFormFields tool:
- Only include fields that need to change in the updates array
- Don't resend values that are already correct in the form
- When auto-filling social worker details, only fill empty fields
- Example: If just updating amount, only send the amount field

Message formatting:
- Use double newlines (\\n\\n) between paragraphs
- Use single newlines (\\n) for lists
- When confirming details, put each item on a new line
- Keep questions on their own line
- Example format:
  "I've noted down the details for the car seat.\\n\\nHere's what I've updated:\\n- Amount: £100\\n- Reason: Car seat purchase for Charlie Bucket\\n\\nShould I send the prepaid card to you, or someone else?"

Form fields available:
- caseNumber (string) - REQUIRED, use lookupCaseNumberByChildName if given a child's name
- reason (string) - REQUIRED, clear description with proper grammar (e.g., "Car seat purchase for Charlie Bucket")
- amount (number) - REQUIRED, the amount needed in pounds (remove £ symbol)
- dateRequired.day (number) - REQUIRED, when the prepaid card is needed
- dateRequired.month (number) - REQUIRED
- dateRequired.year (number) - REQUIRED
- firstName (string) - REQUIRED, first name of person who will receive the prepaid card (properly capitalized)
- lastName (string) - REQUIRED, last name of person who will receive the prepaid card (properly capitalized)
- address.line1 (string) - REQUIRED, address where the prepaid card should be sent (properly formatted)
- address.line2 (string) - Optional additional address line (properly formatted)
- address.town (string) - REQUIRED, town/city for the card delivery (properly capitalized)
- address.postcode (string) - REQUIRED, postcode for the card delivery (proper format)

Example interactions:
1. User: "I need £100 to buy a car seat for charlie bucket"
   Assistant: "I've noted down the car seat request.\\n\\nI've updated:\\n- Amount: £100\\n- Reason: Car seat purchase for Charlie Bucket\\n- Case: #12345 (Charlie Bucket)\\n\\nShould I send the prepaid card to you, or someone else?"

2. User: "Yes, send it to me"
   Assistant: "I'll send it to your address.\\n\\nI've updated:\\n- Name and address details with your information\\n\\nWhen do you need the card by?"

3. User: "I need £50 for school supplies"
   Assistant: "I can help you with that.\\n\\nI've updated:\\n- Amount: £50\\n- Reason: School supplies purchase\\n\\nWhich child's case is this for? You can give me their name or case number."

Be natural but efficient. If you receive a note about manual edits, acknowledge them and continue with any missing information. Always confirm only the fields you've actually changed.`,
});

export const handler: Schema["norm"]["functionHandler"] = async (event) => {
	const { messages = [], initialState = {} } = event.arguments;
	console.log("\n=== Starting new handler invocation ===");
	console.log("Raw event arguments:", event.arguments);

	try {
		// Initialize form state with initial state
		currentFormState = JSON.parse((initialState as string) || "{}");
		console.log("\n=== Initial form state ===");
		console.log(JSON.stringify(currentFormState, null, 2));

		// Parse the incoming messages
		console.log("\n=== Processing incoming messages ===");
		const parsedMessages = (messages || [])
			.map((msg) => {
				if (!msg) return null;
				try {
					const parsed = JSON.parse(msg);
					console.log("\nParsed message:");
					console.log("- Role:", parsed.role);
					console.log("- Content:", parsed.content);
					if (parsed.tool_call_id) {
						console.log("- Tool call ID:", parsed.tool_call_id);
					}
					if (parsed.tool_calls) {
						console.log(
							"- Tool calls:",
							JSON.stringify(parsed.tool_calls, null, 2),
						);
					}
					return parsed;
				} catch (error) {
					console.error("Error parsing message:", msg);
					console.error("Parse error:", error);
					return null;
				}
			})
			.filter(
				(
					msg,
				): msg is {
					role: string;
					content: string;
					tool_call_id?: string;
					tool_calls?: Array<{
						id: string;
						type: "function";
						function: { name: string; arguments: string };
					}>;
				} =>
					msg !== null &&
					typeof msg === "object" &&
					"role" in msg &&
					"content" in msg,
			);

		console.log("\n=== Converting to LangChain format ===");
		// Convert to LangChain message format
		const langchainMessages = parsedMessages.map((msg) => {
			let converted: HumanMessage | ToolMessage | AIMessage;
			switch (msg.role) {
				case "human":
					converted = new HumanMessage(msg.content);
					console.log("Human message:", msg.content);
					break;
				case "tool":
					converted = new ToolMessage({
						content: msg.content,
						tool_call_id: msg.tool_call_id || "",
					});
					console.log("Tool message:", {
						content: msg.content,
						tool_call_id: msg.tool_call_id,
					});
					break;
				case "ai":
					converted = new AIMessage(msg.content);
					console.log("AI message:", msg.content);
					break;
				default:
					converted = new AIMessage(msg.content);
					console.log("Default (AI) message:", msg.content);
			}
			return converted;
		});

		console.log("\n=== Invoking agent ===");
		const result = await agent.invoke({
			messages: langchainMessages,
		});

		// Get the last message from the result
		const lastMessage = result.messages.at(-1);
		if (!lastMessage) {
			throw new Error("No response generated");
		}

		console.log("\n=== Agent response ===");
		console.log("Last message:", lastMessage.content);

		console.log("\n=== Final form state ===");
		console.log(JSON.stringify(currentFormState, null, 2));

		// Return both the message and current form state
		const response = JSON.stringify(
			{
				message: lastMessage.content.toString(),
				formData: currentFormState,
			},
			null, // replacer function - null means all properties
			2, // indent with 2 spaces
		);

		console.log("\n=== Returning response ===");
		console.log(response);

		return response;
	} catch (error) {
		console.error("\n=== Error in handler ===");
		console.error("Error details:", error);
		return "I'm sorry, I encountered an error. Please try again.";
	}
};
