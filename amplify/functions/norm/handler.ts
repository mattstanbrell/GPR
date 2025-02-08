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
import { StateGraph, MessagesAnnotation, START } from "@langchain/langgraph";

/**
 * Example data of childName -> caseNumber
 */
const cases = [
	{ caseNumber: 12345, childName: "Charlie Bucket", childAge: 10 },
	{ caseNumber: 23456, childName: "Veruca Salt", childAge: 12 },
	{ caseNumber: 34567, childName: "Mike Teavee", childAge: 14 },
];

/**
 * Define the Graph State
 */
const FormState = {
	messages: MessagesAnnotation,
};

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
const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));
const llmWithTools = llm.bindTools(tools);

/**
 * Agent Node - Handles the LLM interaction
 */
async function llmCall(state: typeof MessagesAnnotation.State) {
	const system = new SystemMessage({
		content: `You are a helpful assistant for the Hounslow Council's expense request system.
You can look up case numbers when users mention a child's name.
If the user mentions a child's name, use the lookupCaseByChildName tool to find their case number.
Then help the user with their expense request using that information.
Keep your responses professional and concise.
If you don't know something or encounter an error, explain it clearly.`,
	});

	const modelMessages = [system, ...state.messages];
	const response = await llmWithTools.invoke(modelMessages);

	return {
		messages: [response],
	};
}

/**
 * Tool Node - Executes any tool calls
 */
async function toolNode(state: typeof MessagesAnnotation.State) {
	// Performs the tool call
	const results: ToolMessage[] = [];
	const lastMessage: AIMessage | undefined = state.messages.at(-1);

	if (lastMessage?.tool_calls?.length) {
		for (const toolCall of lastMessage.tool_calls) {
			const tool = toolsByName[toolCall.name];
			const args =
				typeof toolCall.args === "string"
					? JSON.parse(toolCall.args)
					: toolCall.args;
			const observation = await tool.invoke(args);
			results.push(
				new ToolMessage({
					content: observation,
					tool_call_id: toolCall.id || "",
				}),
			);
		}
	}

	return { messages: results };
}

/**
 * Route to end after tool execution
 */
function shouldContinue(state: typeof MessagesAnnotation.State) {
	const messages = state.messages;
	const lastMessage: AIMessage | undefined = messages.at(-1);

	// If the LLM makes a tool call, then perform an action
	if (lastMessage?.tool_calls?.length) {
		return "tools";
	}
	// Otherwise, we stop (reply to the user)
	return "__end__";
}

/**
 * Build the Graph
 */
const graph = new StateGraph(MessagesAnnotation)
	.addNode("llmCall", llmCall)
	.addNode("tools", toolNode)
	.addEdge(START, "llmCall")
	.addConditionalEdges("llmCall", shouldContinue)
	.addEdge("tools", "llmCall")
	.compile();

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
		const langchainMessages = parsedMessages.map((msg) =>
			msg.role === "user"
				? new HumanMessage(msg.content)
				: new AIMessage(msg.content),
		);

		// Run the graph
		const finalState = await graph.invoke({
			messages: langchainMessages,
		});

		// Get the last message from the final state
		const lastMessage = finalState.messages.at(-1);
		if (!lastMessage) {
			throw new Error("No response generated");
		}

		console.log("Final response:", lastMessage);
		return lastMessage.content.toString();
	} catch (error) {
		console.error("Error in handler:", error);
		return "I'm sorry, I encountered an error. Please try again.";
	}
};
