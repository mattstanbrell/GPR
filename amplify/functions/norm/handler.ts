import type { Schema } from "../../data/resource";
import { ChatOpenAI } from "@langchain/openai";
import {
	HumanMessage,
	AIMessage,
	SystemMessage,
} from "@langchain/core/messages";

// const SYSTEM_PROMPT = `You are Norm, a helpful assistant for the Hounslow Council's expense request system.
// You help users fill out their expense request forms correctly and efficiently.
// You should be friendly, professional, and helpful.
// You can help users understand what information they need to provide and guide them through the process.
// If you don't know something, just say so.`;

const SYSTEM_PROMPT =
	"You are a helpful assistant. Keep your responses concise.";

export const handler: Schema["norm"]["functionHandler"] = async (event) => {
	const { messages = [] } = event.arguments;

	const model = new ChatOpenAI({
		model: "gpt-4o-mini", // DON'T CHANGE THIS
		apiKey: process.env.OPENAI_API_KEY,
	});

	const parsedMessages = (messages || [])
		.map((msg) => {
			if (!msg) return null;
			try {
				return JSON.parse(msg);
			} catch {
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

	const langchainMessages = [
		new SystemMessage(SYSTEM_PROMPT),
		...parsedMessages.map((msg) =>
			msg.role === "user"
				? new HumanMessage(msg.content)
				: new AIMessage(msg.content),
		),
	];

	try {
		const response = await model.invoke(langchainMessages);
		return response.content.toString();
	} catch (error) {
		console.error("Error calling OpenAI:", error);
		return "I'm sorry, I encountered an error. Please try again.";
	}
};
