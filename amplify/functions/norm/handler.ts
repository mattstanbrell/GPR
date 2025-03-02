import { env } from "$amplify/env/norm";
import type { Schema } from "../../data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export const handler: Schema["Norm"]["functionHandler"] = async (event) => {
	const { conversationID, messages, formID, currentFormState } =
		event.arguments;

	const messagesJSON = JSON.parse(messages ?? "[]");
	const currentFormStateJSON = JSON.parse(currentFormState ?? "{}");
};
