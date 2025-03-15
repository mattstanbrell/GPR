import type { Schema } from "../../../../amplify/data/resource";
import type { UIMessage } from "./types";

// Function to process and format messages from various sources
export const processMessages = (messagesData: string | unknown): UIMessage[] => {
	try {
		const parsed = typeof messagesData === "string" ? JSON.parse(messagesData) : messagesData;
		if (!Array.isArray(parsed)) return [];

		const timestamp = Date.now();
		return parsed
			.filter((msg) => msg.role === "user" || (msg.role === "assistant" && !msg.tool_calls))
			.map((msg, i) => ({
				id: i,
				role: msg.role,
				content: msg.content,
				timestamp,
			}));
	} catch (error) {
		console.error("Error processing messages:", error);
		return [];
	}
};

// Function to validate if all required fields are filled out
export const isFormValid = (form: Partial<Schema["Form"]["type"]> | null): boolean => {
	if (!form) return false;

	// Check required fields
	if (!form.caseNumber?.trim()) return false;
	if (!form.reason?.trim()) return false;
	if (!form.amount || form.amount <= 0) return false;

	// Check date required
	if (!form.dateRequired?.day || !form.dateRequired?.month || !form.dateRequired?.year) return false;

	// Check payment method specific fields
	if (form.paymentMethod === "PURCHASE_ORDER") {
		// Check business details for purchase orders
		if (!form.businessDetails?.name?.trim()) return false;
		if (!form.businessDetails?.address?.lineOne?.trim()) return false;
		if (!form.businessDetails?.address?.townOrCity?.trim()) return false;
		if (!form.businessDetails?.address?.postcode?.trim()) return false;
	} else {
		// Default to PREPAID_CARD validation if not specified or explicitly PREPAID_CARD
		// Check recipient details - name
		if (!form.recipientDetails?.name?.firstName?.trim()) return false;
		if (!form.recipientDetails?.name?.lastName?.trim()) return false;

		// Check recipient details - address
		if (!form.recipientDetails?.address?.lineOne?.trim()) return false;
		if (!form.recipientDetails?.address?.townOrCity?.trim()) return false;
		if (!form.recipientDetails?.address?.postcode?.trim()) return false;
	}

	return true;
};
