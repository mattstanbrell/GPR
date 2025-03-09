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
