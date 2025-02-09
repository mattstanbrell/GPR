import type { Schema } from "../../data/resource";
import { ChatOpenAI } from "@langchain/openai";
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

const StateAnnotation = Annotation.Root({
	...MessagesAnnotation.spec,
	formData: Annotation<{
		caseNumber?: number;
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
	}>,
});

const updateFormFields = tool(
	async (
		{
			updates,
		}: {
			updates: Array<{
				field: string;
				value: string;
				type: "string" | "number";
			}>;
		},
		config,
	) => {
		console.log("updateFormFields tool called with updates:", updates);

		// Helper to update nested fields
		const updateNestedField = (
			currentFormData: Record<string, unknown>,
			path: string[],
			value: string,
			type: "string" | "number",
		) => {
			const current = { ...currentFormData };
			const lastKey = path[path.length - 1];
			let pointer: Record<string, unknown> = current;

			// Navigate to the correct nesting level
			for (let i = 0; i < path.length - 1; i++) {
				const key = path[i];
				if (!(key in pointer)) {
					pointer[key] = {};
				}
				pointer = pointer[key] as Record<string, unknown>;
			}

			// Update the value with proper type conversion
			pointer[lastKey] = type === "number" ? Number(value) : value;
			return current;
		};

		// Get current form data from state or initialize empty object
		const currentFormData = ((config as any).state?.formData || {}) as Record<
			string,
			unknown
		>;

		// Apply all updates in sequence
		let updatedFormData = currentFormData;
		for (const { field, value, type } of updates) {
			const fieldParts = field.split(".");
			updatedFormData = updateNestedField(
				updatedFormData,
				fieldParts,
				value,
				type,
			);
		}

		return new Command({
			update: {
				formData: updatedFormData,
				messages: [
					new ToolMessage({
						content: `Updated fields: ${updates
							.map(({ field, value }) => `${field} to ${value}`)
							.join(", ")}`,
						tool_call_id: config.toolCall.id,
					}),
				],
			},
		});
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
								"The type of the field - use 'number' for caseNumber, amount, and all dateRequired fields. Use 'string' for everything else.",
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

const agent = createReactAgent({
	llm: model,
	tools: [updateFormFields],
	stateSchema: StateAnnotation,
	stateModifier:
		"You are a helpful assistant that can update any field in the form. The form has the following fields:\n" +
		"- caseNumber (number)\n" +
		"- reason (string)\n" +
		"- amount (number)\n" +
		"- dateRequired.day (number)\n" +
		"- dateRequired.month (number)\n" +
		"- dateRequired.year (number)\n" +
		"- firstName (string)\n" +
		"- lastName (string)\n" +
		"- address.line1 (string)\n" +
		"- address.line2 (string)\n" +
		"- address.town (string)\n" +
		"- address.postcode (string)\n" +
		"\nWhen updating fields, use the appropriate type ('number' or 'string') for each field.",
});

export const handler: Schema["norm"]["functionHandler"] = async (event) => {
	const { messages = [], initialState = {} } = event.arguments;
	console.log("Received event arguments:", event.arguments);

	try {
		// Parse the incoming messages
		const parsedMessages = (messages || [])
			.map((msg) => {
				if (!msg) return null;
				try {
					const parsed = JSON.parse(msg);
					console.log("Successfully parsed message:", parsed);
					return parsed;
				} catch (error) {
					console.error("Error parsing message:", msg, error);
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

		console.log("Parsed messages:", parsedMessages);

		// Convert to LangChain message format
		const langchainMessages = parsedMessages.map((msg) => {
			switch (msg.role) {
				case "human":
					return new HumanMessage(msg.content);
				case "tool":
					return new ToolMessage({
						content: msg.content,
						tool_call_id: msg.tool_call_id || "",
					});
				case "ai":
					return new AIMessage(msg.content);
				default:
					return new AIMessage(msg.content);
			}
		});

		// Parse initial state
		const parsedInitialState = JSON.parse((initialState as string) || "{}");
		console.log("Initial state:", parsedInitialState);

		// Run the graph with initial state
		const finalState = await agent.invoke({
			messages: langchainMessages,
			formData: parsedInitialState,
		});

		console.log("Final state:", finalState);

		// Get the last message from the final state
		const lastMessage = finalState.messages.at(-1);
		if (!lastMessage) {
			throw new Error("No response generated");
		}

		console.log("Final response:", lastMessage);
		// Return both the message and form data
		return JSON.stringify({
			message: lastMessage.content.toString(),
			formData: finalState.formData,
		});
	} catch (error) {
		console.error("Error in handler:", error);
		return "I'm sorry, I encountered an error. Please try again.";
	}
};
