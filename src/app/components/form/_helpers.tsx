import type { Schema } from "../../../../amplify/data/resource";
import type { UIMessage } from "./types";
import type { RecurrencePattern, DayOfWeek } from "../../types/recurrence";
import { monthNumberToEnum } from "../../types/recurrence";

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
	if (form.expenseType === "PURCHASE_ORDER") {
		// Check business details for purchase orders
		if (!form.businessDetails?.name?.trim()) return false;
		if (!form.businessDetails?.address?.lineOne?.trim()) return false;
		if (!form.businessDetails?.address?.townOrCity?.trim()) return false;
		if (!form.businessDetails?.address?.postcode?.trim()) return false;

		// Only check recurring payment fields for purchase orders
		if (form.isRecurring) {
			// Check required recurrence pattern fields
			if (!form.recurrencePattern) return false;
			if (!form.recurrencePattern.frequency) return false;
			if (!form.recurrencePattern.interval || form.recurrencePattern.interval < 1) return false;
			if (!form.recurrencePattern.startDate) return false;

			// Check frequency-specific fields
			if (
				form.recurrencePattern.frequency === "WEEKLY" &&
				(!form.recurrencePattern.daysOfWeek || form.recurrencePattern.daysOfWeek.length === 0)
			) {
				return false;
			}

			if (form.recurrencePattern.frequency === "MONTHLY") {
				// For monthly, we need either dayOfMonth, monthPosition, or monthEnd
				const hasDayOfMonth = form.recurrencePattern.dayOfMonth && form.recurrencePattern.dayOfMonth.length > 0;
				const hasMonthPosition = !!form.recurrencePattern.monthPosition;
				const hasMonthEnd = !!form.recurrencePattern.monthEnd;

				if (!hasDayOfMonth && !hasMonthPosition && !hasMonthEnd) {
					return false;
				}
			}

			if (form.recurrencePattern.frequency === "YEARLY") {
				// For yearly, we need months
				if (!form.recurrencePattern.months || form.recurrencePattern.months.length === 0) {
					return false;
				}
			}

			// Check end conditions
			if (!form.recurrencePattern.neverEnds) {
				// If not never-ending, we need either endDate or maxOccurrences
				if (!form.recurrencePattern.endDate && !form.recurrencePattern.maxOccurrences) {
					return false;
				}
			}
		}
	} else {
		// Default to PREPAID_CARD validation if not specified or explicitly PREPAID_CARD
		// Check recipient details - name
		if (!form.recipientDetails?.name?.firstName?.trim()) return false;
		if (!form.recipientDetails?.name?.lastName?.trim()) return false;

		// Check recipient details - address
		if (!form.recipientDetails?.address?.lineOne?.trim()) return false;
		if (!form.recipientDetails?.address?.townOrCity?.trim()) return false;
		if (!form.recipientDetails?.address?.postcode?.trim()) return false;

		// Ensure recurring payment is disabled for prepaid cards
		if (form.isRecurring) return false;
	}

	return true;
};

// Function to calculate the next N occurrences of a recurrence pattern
export function calculateNextOccurrences(pattern: RecurrencePattern, count = 5): Date[] {
	const occurrences: Date[] = [];
	const startDate = new Date(pattern.startDate);

	if (Number.isNaN(startDate.getTime())) {
		throw new Error("Invalid start date");
	}

	const currentDate = new Date(startDate);

	// Map day numbers to day names for weekly recurrence
	const dayOfWeekMap: Record<number, DayOfWeek> = {
		0: "SUNDAY",
		1: "MONDAY",
		2: "TUESDAY",
		3: "WEDNESDAY",
		4: "THURSDAY",
		5: "FRIDAY",
		6: "SATURDAY",
	};

	while (occurrences.length < count) {
		// Check if we've reached the end date
		if (pattern.endDate) {
			const endDate = new Date(pattern.endDate);
			if (currentDate > endDate) break;
		}

		// Check if we've reached max occurrences
		if (pattern.maxOccurrences && occurrences.length >= pattern.maxOccurrences) {
			break;
		}

		// Check if date is excluded
		const isExcluded =
			pattern.excludedDates?.some((excludedDate) => {
				const excluded = new Date(excludedDate);
				return (
					excluded.getFullYear() === currentDate.getFullYear() &&
					excluded.getMonth() === currentDate.getMonth() &&
					excluded.getDate() === currentDate.getDate()
				);
			}) ?? false;

		// Function to check if the current date matches the pattern
		const isMatchingDate = (): boolean => {
			switch (pattern.frequency) {
				case "DAILY": {
					return true;
				}

				case "WEEKLY": {
					// For weekly, check if the current day of week is in the daysOfWeek array
					if (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) {
						// If no days specified, use the day of week from the start date
						const startDayOfWeek = startDate.getDay();
						return currentDate.getDay() === startDayOfWeek;
					}

					const currentDayOfWeek = dayOfWeekMap[currentDate.getDay()];
					return pattern.daysOfWeek.includes(currentDayOfWeek);
				}

				case "MONTHLY": {
					// First check if this month is allowed
					if (pattern.months && pattern.months.length > 0) {
						const currentMonth = monthNumberToEnum(currentDate.getMonth() + 1);
						if (!pattern.months.includes(currentMonth)) {
							return false;
						}
					}

					// For monthly, check day of month or month position
					if (pattern.dayOfMonth && pattern.dayOfMonth.length > 0) {
						return pattern.dayOfMonth.includes(currentDate.getDate());
					}

					if (pattern.monthEnd) {
						// Check if it's the last day of the month
						const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
						return currentDate.getDate() === lastDay;
					}

					if (pattern.monthPosition) {
						const { position, dayOfWeek } = pattern.monthPosition;
						const dayOfWeekMap: Record<DayOfWeek, number> = {
							SUNDAY: 0,
							MONDAY: 1,
							TUESDAY: 2,
							WEDNESDAY: 3,
							THURSDAY: 4,
							FRIDAY: 5,
							SATURDAY: 6,
						};

						const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
						const matchingDates: number[] = [];

						for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
							const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
							if (date.getDay() === dayOfWeekMap[dayOfWeek]) {
								matchingDates.push(d);
							}
						}

						// Get the date based on position
						let targetDate: number;
						switch (position) {
							case "FIRST":
								targetDate = matchingDates[0];
								break;
							case "SECOND":
								targetDate = matchingDates[1];
								break;
							case "THIRD":
								targetDate = matchingDates[2];
								break;
							case "FOURTH":
								targetDate = matchingDates[3];
								break;
							case "LAST":
								targetDate = matchingDates[matchingDates.length - 1];
								break;
							default:
								return false;
						}

						return currentDate.getDate() === targetDate;
					}

					return false;
				}

				case "YEARLY": {
					// For yearly, check if the month is in the months array
					if (!pattern.months || pattern.months.length === 0) {
						// If no months specified, use the month from the start date
						return currentDate.getMonth() === startDate.getMonth();
					}

					// Convert current month to Month enum
					const currentMonth = monthNumberToEnum(currentDate.getMonth() + 1);
					return pattern.months.includes(currentMonth);
				}

				default:
					return false;
			}
		};

		if (!isExcluded && isMatchingDate()) {
			occurrences.push(new Date(currentDate));
		}

		// Move to the next day
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return occurrences;
}
