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

export type FormChanges = Record<
	string,
	{
		from: unknown;
		to: unknown;
	}
>;

export interface UIMessage {
	id: number;
	role: "user" | "assistant";
	content: string;
}
