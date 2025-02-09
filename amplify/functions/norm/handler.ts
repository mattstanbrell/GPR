import type { Schema } from "../../data/resource";
import { ChatOpenAI } from "@langchain/openai";
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
		name: "Charles Bucket",
		caseNumber: "12350",
		age: 8,
	},
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
	cases: ["12345", "12346", "12347", "12348", "12349", "12350"],
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
	dateRequiredDay?: number;
	dateRequiredMonth?: number;
	dateRequiredYear?: number;
	firstName?: string;
	lastName?: string;
	addressLine1?: string;
	addressLine2?: string;
	addressTown?: string;
	addressPostcode?: string;
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

		const searchName = childName.toLowerCase().trim();
		console.log("Normalized search name:", searchName);

		// Filter cases that belong to the social worker
		const availableCases = dummyChildData.filter((child) =>
			socialWorker.cases.includes(child.caseNumber),
		);
		console.log("Available cases:", availableCases);

		// Look for exact matches first (case-insensitive)
		const exactMatches = availableCases.filter(
			(child) => child.name.toLowerCase() === searchName,
		);

		// Look for partial matches
		const partialMatches = availableCases.filter(
			(child) =>
				child.name.toLowerCase().includes(searchName) ||
				searchName.includes(child.name.toLowerCase()),
		);

		console.log("Exact matches found:", exactMatches);
		console.log("Partial matches found:", partialMatches);

		let result: {
			status: "exact_match" | "partial_match" | "no_match";
			caseNumber?: string;
			message: string;
			matches?: typeof partialMatches;
		};

		if (exactMatches.length === 1) {
			result = {
				status: "exact_match",
				caseNumber: exactMatches[0].caseNumber,
				message: `Found case number ${exactMatches[0].caseNumber} for ${exactMatches[0].name}.`,
			};
		} else if (partialMatches.length === 1) {
			result = {
				status: "partial_match",
				caseNumber: partialMatches[0].caseNumber,
				matches: partialMatches,
				message: `Found one possible match: ${partialMatches[0].name}. If this is correct, proceed with case ${partialMatches[0].caseNumber}. If not, ask the social worker to clarify or provide the case number directly.`,
			};
		} else if (partialMatches.length > 1) {
			result = {
				status: "partial_match",
				matches: partialMatches,
				message: `Found ${partialMatches.length} possible matches. Ask the social worker which child they mean, showing ONLY these matches:\n${partialMatches.map((child) => `- ${child.name} (Case ${child.caseNumber})`).join("\n")}`,
			};
		} else {
			result = {
				status: "no_match",
				message: `No matches found for "${childName}". As a last resort, here are all available cases:\n${availableCases.map((child) => `- ${child.name} (Case ${child.caseNumber})`).join("\n")}\n\nAsk the social worker to either select from this list or provide a case number directly.`,
			};
		}

		console.log("Returning result:", result);
		return result;
	},
	{
		name: "lookupCaseNumberByChildName",
		description:
			"Look up a child's case number by their name. Returns exact matches if found, otherwise provides guidance for handling partial matches or no matches.",
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

		// Apply all updates directly to the form state
		for (const { field, value, type } of updates) {
			if (field.includes(".")) {
				console.log(`Warning: Nested field ${field} is no longer supported`);
				continue;
			}

			const formField = field as keyof FormState;
			const formState = currentFormState as Record<
				keyof FormState,
				string | number | undefined
			>;

			if (field === "caseNumber") {
				formState[formField] = value; // Always keep caseNumber as string
			} else if (type === "number") {
				formState[formField] = value === "" ? undefined : Number(value);
			} else {
				formState[formField] = value;
			}
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
		description: `Update the form fields. You must provide an array, eg [{"caseNumber", "12345", "string"}, {"reason", "Car seat for Charlie Bucket", "string"}, {"amount", "100", "number"}, {"dateRequiredDay", "1", "number"}, {"dateRequiredMonth", "1", "number"}, {"dateRequiredYear", "2025", "number"}]`,
		schema: z.object({
			updates: z
				.array(
					z.object({
						field: z
							.string()
							.describe(
								"The field name to update (e.g. 'addressLine1' or 'dateRequiredDay').",
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

const model = new ChatOpenAI({
	model: "gpt-4o", // DON'T CHANGE THIS
	apiKey: process.env.OPENAI_API_KEY,
});

// const model = new ChatGoogleGenerativeAI({
// 	model: "gemini-2.0-flash", // DON'T CHANGE THIS
// 	apiKey: process.env.GOOGLE_API_KEY,
// });

// const model = new ChatAnthropic({
// 	model: "claude-3-5-sonnet-latest", // DON'T CHANGE THIS
// 	apiKey: process.env.ANTHROPIC_API_KEY,
// });

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

// Helper function to get tomorrow's date components
const getTomorrowDate = () => {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	return {
		day: tomorrow.getDate(),
		month: tomorrow.getMonth() + 1, // JavaScript months are 0-based
		year: tomorrow.getFullYear(),
	};
};

// Log the state modifier for debugging
const stateModifier = `You are a friendly assistant helping social workers submit prepaid card requests. You help fill out a form based on their natural language requests.

Current time in London: ${formatLondonTime()}

Current social worker details (use these to auto-fill fields if they are the card recipient):
Name: ${socialWorker.name}
Address Line 1: ${socialWorker.address.line1}
Town: ${socialWorker.address.town}
Postcode: ${socialWorker.address.postcode}

Key points:
- Each request needs a case number - if given a child's name, look it up using the lookupCaseNumberByChildName tool
- Keep responses friendly and concise
- Only update fields that have new information
- Ask for only 1-2 pieces of information at a time
- If they say the card is for them, auto-fill their details
- Update fields immediately upon recieiving relevant information
- Use correct grammar and punctuation in form fields, eg "Car seat for Charlie". Feel free to reword the social worker's reason for clarity.
- If you receive new information that contradicts previous information, update the fields accordingly using updateFormFields
- Social workers can manually edit the form fields between messages. These updates are already recorded in the form state, so don't repeat them with updateFormFields calls.

Message formatting:
- Be conversational but efficient
- Ask clear, simple questions

Examples:
Social worker: "I need £100 to buy a car seat for Charlie Bucket"
Assistant: 
[calls lookupCaseNumberByChildName with "Charlie Bucket"]
[calls updateFormFields with [{field: "caseNumber", value: "12345", type: "string"}, {field: "reason", value: "Car seat for Charlie Bucket", type: "string"}, {field: "amount", value: "100", type: "number"}]]
"I've noted the £100 for Charlie's car seat. When do you need the card by?"
Social worker: "Wait, I actually need £110"
Assistant: [calls updateFormFields with [{field: "amount", value: "110", type: "number"}]]
"I've updated the amount to £110. When do you need the card by?"

Social worker: "I need £50 by tomorrow"
Assistant: [calls updateFormFields with [{field: "amount", value: "50", type: "number"}, {field: "dateRequiredDay", value: "${getTomorrowDate().day}", type: "number"}, {field: "dateRequiredMonth", value: "${getTomorrowDate().month}", type: "number"}, {field: "dateRequiredYear", value: "${getTomorrowDate().year}", type: "number"}]]
"I see. Which child is this expense for?"

Form fields available:
- caseNumber (string) - REQUIRED - Case number of the child the expense is for
- reason (string) - REQUIRED - Reason for the expense
- amount (number) - REQUIRED - Amount of the expense (remove any currency symbols)
- dateRequiredDay (number) - REQUIRED - Day of the month the expense is needed by
- dateRequiredMonth (number) - REQUIRED - Month the expense is needed by
- dateRequiredYear (number) - REQUIRED - Year the expense is needed by
- firstName (string) - REQUIRED - First name of the card recipient
- lastName (string) - REQUIRED - Last name of the card recipient
- addressLine1 (string) - REQUIRED - First line of the card recipient's address
- addressLine2 (string) - Optional - Second line of the card recipient's address
- addressTown (string) - REQUIRED - Town of the card recipient's address
- addressPostcode (string) - REQUIRED - Postcode of the card recipient's address

Remember:
- Ask directly about form details (e.g. "Are you the card recipient?") rather than offering help (e.g. "Should I send the card to your address?")
- Be natural and friendly
- Ask for missing information one step at a time`;

console.log("\n=== Agent State Modifier ===");
console.log(stateModifier);

const agent = createReactAgent({
	llm: model,
	tools: [updateFormFields, lookupCaseNumberByChildName],
	stateModifier,
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
