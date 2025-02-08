import type { Schema } from "../../data/resource";
import { ChatOpenAI } from "@langchain/openai";
import {
	HumanMessage,
	AIMessage,
	SystemMessage,
	ToolMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Example data of childName -> caseNumber
 */
const cases = [
	{ caseNumber: 12345, childName: "Charlie Bucket", childAge: 10 },
	{ caseNumber: 23456, childName: "Veruca Salt", childAge: 12 },
	{ caseNumber: 34567, childName: "Mike Teavee", childAge: 14 },
];

/**
 * The lookup tool
 */
const lookupCaseByChildName = tool(
	async ({ childName }: { childName: string }) => {
		const found = cases.find(
			(c) => c.childName.toLowerCase() === childName.toLowerCase(),
		);
		if (!found) {
			throw new Error(`No case found for childName=${childName}`);
		}
		return `Case number is ${found.caseNumber}`;
	},
	{
		name: "lookupCaseByChildName",
		description: `Look up a case number by child's name. 
			Input: { childName: string }. 
			Returns the case number or throws an error if not found.`,
		schema: z.object({
			childName: z.string(),
		}),
	},
);

// Create LLM instance with tool
const llm = new ChatOpenAI({
	model: "gpt-4o-mini", // DON'T CHANGE THIS
	temperature: 0,
	apiKey: process.env.OPENAI_API_KEY,
});
const tools = [lookupCaseByChildName];
const llmWithTools = llm.bindTools(tools);

const SYSTEM_PROMPT = new SystemMessage({
	content: `You are a helpful assistant for the Hounslow Council's expense request system.
You can look up case numbers when users mention a child's name.
If the user mentions a child's name, use the lookupCaseByChildName tool to find their case number.
Then help the user with their expense request using that information.
Keep your responses professional and concise.
If you don't know something or encounter an error, explain it clearly.`,
});

/**
 * Execute any tool calls and return their responses
 */
async function executeTools(message: AIMessage): Promise<ToolMessage[]> {
	if (!message.additional_kwargs?.tool_calls?.length) {
		return [];
	}

	const toolResponses: ToolMessage[] = [];
	for (const toolCall of message.additional_kwargs.tool_calls) {
		const toolFn = tools.find((t) => t.name === toolCall.function.name);
		if (!toolFn) {
			throw new Error(`Unknown tool: ${toolCall.function.name}`);
		}
		const args = JSON.parse(toolCall.function.arguments);
		const result = await toolFn.invoke(args);
		toolResponses.push(
			new ToolMessage({ content: result, tool_call_id: toolCall.id }),
		);
	}
	return toolResponses;
}

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
				(msg): msg is { role: string; content: string } =>
					msg !== null &&
					typeof msg === "object" &&
					"role" in msg &&
					"content" in msg,
			);

		console.log("Parsed messages:", parsedMessages);

		// Convert to LangChain message format
		const langchainMessages = [
			SYSTEM_PROMPT,
			...parsedMessages.map((msg) =>
				msg.role === "user"
					? new HumanMessage(msg.content)
					: new AIMessage(msg.content),
			),
		];

		// Get initial LLM response
		const llmResponse = await llmWithTools.invoke(langchainMessages);
		console.log("Initial LLM response:", llmResponse);

		// Execute any tool calls
		const toolResponses = await executeTools(llmResponse);
		console.log("Tool responses:", toolResponses);

		if (toolResponses.length > 0) {
			// If we got tool responses, send another request to the LLM with the tool results
			const finalResponse = await llmWithTools.invoke([
				...langchainMessages,
				llmResponse,
				...toolResponses,
			]);
			console.log("Final LLM response:", finalResponse);
			return finalResponse.content.toString();
		}

		// If no tool calls, return the initial response
		return llmResponse.content.toString();
	} catch (error) {
		console.error("Error in handler:", error);
		return "I'm sorry, I encountered an error. Please try again.";
	}
};
