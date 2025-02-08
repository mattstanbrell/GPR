import type { Schema } from "../../data/resource";

export const handler: Schema["sayHello"]["functionHandler"] = async (event) => {
	const { name } = event.arguments;

	// This will return both the greeting and the formatted time to verify moment is working
	return `Hello, ${name}! The key is ${process.env.OPENAI_API_KEY?.substring(0, 5)}`;
};
