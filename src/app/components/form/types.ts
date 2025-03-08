import type { Schema } from "../../../../amplify/data/resource";

// Use the Schema type but only include the fields we need for the form UI
export type FormData = Pick<
	Schema["Form"]["type"],
	| "status"
	| "caseNumber"
	| "reason"
	| "amount"
	| "dateRequired"
	| "recipientDetails"
> & {
	id?: string;
};

// Message type for our UI
export type UIMessage = {
	id: number;
	role: "user" | "assistant";
	content: string;
};
