// Types for recurring payment patterns

export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export type Position = "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "LAST";
export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

// Legacy lowercase versions for backward compatibility
export type DayOfWeekLegacy = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export type PositionLegacy = "first" | "second" | "third" | "fourth" | "last";
export type FrequencyLegacy = "daily" | "weekly" | "monthly" | "yearly";

// Month enum (1-12)
export type Month =
	| "JANUARY"
	| "FEBRUARY"
	| "MARCH"
	| "APRIL"
	| "MAY"
	| "JUNE"
	| "JULY"
	| "AUGUST"
	| "SEPTEMBER"
	| "OCTOBER"
	| "NOVEMBER"
	| "DECEMBER";

// Helper functions to convert between enum formats
export function toUpperCaseEnum<T extends string>(value: string, enumType: Record<string, T>): T {
	const upperValue = value.toUpperCase() as keyof typeof enumType;
	return enumType[upperValue];
}

export function toLowerCaseDay(day: DayOfWeek): DayOfWeekLegacy {
	return day.toLowerCase() as DayOfWeekLegacy;
}

export function toUpperCaseDay(day: DayOfWeekLegacy): DayOfWeek {
	return day.toUpperCase() as DayOfWeek;
}

export function monthNumberToEnum(monthNum: number): Month {
	const months: Month[] = [
		"JANUARY",
		"FEBRUARY",
		"MARCH",
		"APRIL",
		"MAY",
		"JUNE",
		"JULY",
		"AUGUST",
		"SEPTEMBER",
		"OCTOBER",
		"NOVEMBER",
		"DECEMBER",
	];
	return months[monthNum - 1]; // Convert 1-based to 0-based index
}

export function monthEnumToNumber(month: Month): number {
	const months: Month[] = [
		"JANUARY",
		"FEBRUARY",
		"MARCH",
		"APRIL",
		"MAY",
		"JUNE",
		"JULY",
		"AUGUST",
		"SEPTEMBER",
		"OCTOBER",
		"NOVEMBER",
		"DECEMBER",
	];
	return months.indexOf(month) + 1; // Convert 0-based to 1-based index
}

export interface MonthPosition {
	position: Position;
	dayOfWeek: DayOfWeek;
}

export interface YearPosition {
	position: Position;
	day_of_week: DayOfWeek;
	month: Month | number; // Can be either Month enum or number 1-12
}

export interface RecurrencePattern {
	// REQUIRED FIELDS
	frequency: Frequency;
	interval: number;
	startDate: string; // ISO date string

	// OPTIONAL END CONDITIONS
	endDate?: string; // ISO date string
	maxOccurrences?: number;
	neverEnds?: boolean;

	// WEEKLY RECURRENCE SPECIFIERS
	daysOfWeek?: DayOfWeek[]; // Values should be: "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"

	// MONTHLY RECURRENCE SPECIFIERS
	dayOfMonth?: number[]; // 1-31, supports multiple days
	monthEnd?: boolean;
	monthPosition?: MonthPosition;

	// YEARLY RECURRENCE SPECIFIERS
	months?: number[]; // 1-12 representing JANUARY through DECEMBER

	// EXCLUDED DATES
	excludedDates?: string[]; // ISO date strings

	// METADATA
	description?: string;
}

export interface RecurringPayment {
	recurring: boolean;
	pattern: RecurrencePattern;
	created_at?: string;
	created_by?: string;
}

// Helper function to generate a human-readable description of a recurrence pattern
export function generateRecurrenceDescription(pattern: RecurrencePattern): string {
	let description = "";

	// Add frequency and interval
	const frequency = pattern.frequency.toLowerCase();
	if (pattern.interval === 1) {
		description = `Every ${frequency.slice(0, -2)}y`;
	} else {
		description = `Every ${pattern.interval} ${frequency}s`;
	}

	// Add day specifics for weekly
	if (pattern.frequency === "WEEKLY" && pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
		const daysCapitalized = pattern.daysOfWeek.map((day) => day.charAt(0) + day.slice(1).toLowerCase());

		if (pattern.daysOfWeek.length === 7) {
			description += " on every day";
		} else if (
			pattern.daysOfWeek.length === 5 &&
			pattern.daysOfWeek.includes("MONDAY") &&
			pattern.daysOfWeek.includes("TUESDAY") &&
			pattern.daysOfWeek.includes("WEDNESDAY") &&
			pattern.daysOfWeek.includes("THURSDAY") &&
			pattern.daysOfWeek.includes("FRIDAY")
		) {
			description += " on weekdays";
		} else if (
			pattern.daysOfWeek.length === 2 &&
			pattern.daysOfWeek.includes("SATURDAY") &&
			pattern.daysOfWeek.includes("SUNDAY")
		) {
			description += " on weekends";
		} else {
			description += ` on ${daysCapitalized.join(", ")}`;
		}
	}

	// Add day specifics for monthly
	if (pattern.frequency === "MONTHLY") {
		if (pattern.dayOfMonth && pattern.dayOfMonth.length > 0) {
			if (pattern.dayOfMonth.length === 1) {
				description += ` on day ${pattern.dayOfMonth[0]}`;
			} else {
				description += ` on days ${pattern.dayOfMonth.join(", ")}`;
			}
		}

		if (pattern.monthEnd) {
			description += " on the last day";
		}

		if (pattern.monthPosition) {
			const { position, dayOfWeek } = pattern.monthPosition;
			const positionText = position.toLowerCase();
			const dayText = dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase();
			description += ` on the ${positionText} ${dayText}`;
		}
	}

	// Add month specifics for yearly
	if (pattern.frequency === "YEARLY" && pattern.months && pattern.months.length > 0) {
		const monthNames = pattern.months
			.map((m) => {
				const date = new Date(2000, m - 1, 1);
				return date.toLocaleString("default", { month: "long" });
			})
			.join(", ");
		description += ` in ${monthNames}`;
	}

	// Add start date
	if (pattern.startDate) {
		const startDate = new Date(pattern.startDate);
		const formattedDate = startDate.toLocaleDateString();
		description += `, starting ${formattedDate}`;
	}

	// Add end condition
	if (pattern.endDate) {
		const endDate = new Date(pattern.endDate);
		const formattedDate = endDate.toLocaleDateString();
		description += ` until ${formattedDate}`;
	} else if (pattern.maxOccurrences) {
		description += ` for ${pattern.maxOccurrences} occurrences`;
	} else if (pattern.neverEnds) {
		description += " with no end date";
	}

	return description;
}

// Function to calculate the next N occurrences of a recurrence pattern
export function calculateNextOccurrences(pattern: RecurrencePattern, count = 5): Date[] {
	const occurrences: Date[] = [];
	const startDate = new Date(pattern.startDate);

	if (Number.isNaN(startDate.getTime())) {
		throw new Error("Invalid start date");
	}

	let currentDate = new Date(startDate);

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

						// Get all dates in the current month that match the day of week
						const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
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

					// Convert month to 1-based index to match the months array
					const currentMonth = currentDate.getMonth() + 1;
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

// Helper function to get the day of the year (1-366)
function getDayOfYear(date: Date): number {
	const start = new Date(date.getFullYear(), 0, 0);
	const diff = date.getTime() - start.getTime();
	const oneDay = 1000 * 60 * 60 * 24;
	return Math.floor(diff / oneDay);
}
