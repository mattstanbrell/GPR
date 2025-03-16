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

	// Check recurring payment fields if recurring is enabled
	if (form.recurring) {
		// Check required recurrence pattern fields
		if (!form.recurrence_pattern) return false;
		if (!form.recurrence_pattern.frequency) return false;
		if (!form.recurrence_pattern.interval || form.recurrence_pattern.interval < 1) return false;
		if (!form.recurrence_pattern.start_date) return false;

		// Check frequency-specific fields
		if (
			form.recurrence_pattern.frequency === "WEEKLY" &&
			(!form.recurrence_pattern.days_of_week || form.recurrence_pattern.days_of_week.length === 0)
		) {
			return false;
		}

		if (form.recurrence_pattern.frequency === "MONTHLY") {
			// For monthly, we need either day_of_month, month_position, or month_end
			const hasDayOfMonth = form.recurrence_pattern.day_of_month && form.recurrence_pattern.day_of_month.length > 0;
			const hasMonthPosition = !!form.recurrence_pattern.month_position;
			const hasMonthEnd = !!form.recurrence_pattern.month_end;

			if (!hasDayOfMonth && !hasMonthPosition && !hasMonthEnd) {
				return false;
			}
		}

		if (form.recurrence_pattern.frequency === "YEARLY") {
			// For yearly, we need months
			if (!form.recurrence_pattern.months || form.recurrence_pattern.months.length === 0) {
				return false;
			}
		}

		// Check end conditions
		if (!form.recurrence_pattern.never_ends) {
			// If not never-ending, we need either end_date or max_occurrences
			if (!form.recurrence_pattern.end_date && !form.recurrence_pattern.max_occurrences) {
				return false;
			}
		}
	}

	return true;
};
