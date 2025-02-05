import type { Schema } from "../../data/resource";
import moment from "moment";

export const handler: Schema["sayHello"]["functionHandler"] = async (event) => {
	const { name } = event.arguments;
	const currentTime = moment().format("MMMM Do YYYY, h:mm:ss a");

	// This will return both the greeting and the formatted time to verify moment is working
	return `Hello, ${name}! The secret is ${process.env.FOO}. Current time: ${currentTime}`;
};
