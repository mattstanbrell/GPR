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
	caseNumber: Annotation<number>,
});

const updateFormField = tool(
	async ({ field, value }: { field: string; value: number }, config) => {
		console.log(
			`updateFormField tool called with field: ${field}, value: ${value}`,
		);
		if (field !== "caseNumber") {
			throw new Error("Can only update caseNumber field");
		}
		// Log the current case number before update
		console.log("Current tool config:", config);
		return new Command({
			update: {
				caseNumber: value,
				messages: [
					new ToolMessage({
						content: `Updated case number to ${value}`,
						tool_call_id: config.toolCall.id,
					}),
				],
			},
		});
	},
	{
		name: "updateFormField",
		description: "Update the case number.",
		schema: z.object({
			field: z
				.string()
				.describe("The field name to update (must be 'caseNumber')."),
			value: z.number().describe("The new case number value."),
		}),
	},
);

const model = new ChatOpenAI({
	model: "gpt-4o",
	apiKey: process.env.OPENAI_API_KEY,
});

const agent = createReactAgent({
	llm: model,
	tools: [updateFormField],
	stateSchema: StateAnnotation,
	stateModifier: "You are a helpful assistant that can update the case number.",
});

export const handler: Schema["norm"]["functionHandler"] = async (event) => {
	const { messages = [] } = event.arguments;
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
				): msg is { role: string; content: string; tool_call_id?: string } =>
					msg !== null &&
					typeof msg === "object" &&
					"role" in msg &&
					"content" in msg,
			);

		console.log("Parsed messages:", parsedMessages);

		// Convert to LangChain message format
		const langchainMessages = parsedMessages.map((msg) => {
			switch (msg.role) {
				case "user":
					return new HumanMessage(msg.content);
				case "tool":
					return new ToolMessage({
						content: msg.content,
						tool_call_id: msg.tool_call_id || "",
					});
				default:
					return new AIMessage(msg.content);
			}
		});

		// Run the graph
		const finalState = await agent.invoke({
			messages: langchainMessages,
		});

		console.log("Final state:", finalState);

		// Get the last message from the final state
		const lastMessage = finalState.messages.at(-1);
		if (!lastMessage) {
			throw new Error("No response generated");
		}

		console.log("Final response:", lastMessage);
		// Return both the message and the current case number
		return JSON.stringify({
			message: lastMessage.content.toString(),
			caseNumber: finalState.caseNumber,
		});
	} catch (error) {
		console.error("Error in handler:", error);
		return "I'm sorry, I encountered an error. Please try again.";
	}
};
