import type { FormData, UIMessage } from "./types";

// Function to process and format messages from various sources
export const processMessages = (
	messagesData: string | unknown,
): UIMessage[] => {
	try {
		const parsed =
			typeof messagesData === "string"
				? JSON.parse(messagesData)
				: messagesData;
		if (!Array.isArray(parsed)) return [];

		const timestamp = Date.now();
		return parsed
			.filter(
				(msg) =>
					msg.role === "user" || (msg.role === "assistant" && !msg.tool_calls),
			)
			.map((msg, i) => ({
				id: timestamp + i, // Consistent ID generation using timestamp + index
				role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
				content: msg.content || "",
			}));
	} catch {
		return [];
	}
};

// Function to validate if all required fields are filled out
export const isFormValid = (form: FormData | null): boolean => {
	if (!form) return false;

	// Check required fields
	if (!form.caseNumber?.trim()) return false;
	if (!form.reason?.trim()) return false;
	if (!form.amount || form.amount <= 0) return false;

	// Check date required
	if (
		!form.dateRequired?.day ||
		!form.dateRequired?.month ||
		!form.dateRequired?.year
	)
		return false;

	// Check recipient details - name
	if (!form.recipientDetails?.name?.firstName?.trim()) return false;
	if (!form.recipientDetails?.name?.lastName?.trim()) return false;

	// Check recipient details - address
	if (!form.recipientDetails?.address?.lineOne?.trim()) return false;
	if (!form.recipientDetails?.address?.townOrCity?.trim()) return false;
	if (!form.recipientDetails?.address?.postcode?.trim()) return false;

	return true;
};
