// Types for recurring payment patterns

export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export type Position = "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "LAST";
export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

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

// Display mappings for UI
export const DAYS_OF_WEEK = [
	{ value: "MONDAY" as DayOfWeek, label: "Monday" },
	{ value: "TUESDAY" as DayOfWeek, label: "Tuesday" },
	{ value: "WEDNESDAY" as DayOfWeek, label: "Wednesday" },
	{ value: "THURSDAY" as DayOfWeek, label: "Thursday" },
	{ value: "FRIDAY" as DayOfWeek, label: "Friday" },
	{ value: "SATURDAY" as DayOfWeek, label: "Saturday" },
	{ value: "SUNDAY" as DayOfWeek, label: "Sunday" },
];

export const POSITIONS = [
	{ value: "FIRST" as Position, label: "First" },
	{ value: "SECOND" as Position, label: "Second" },
	{ value: "THIRD" as Position, label: "Third" },
	{ value: "FOURTH" as Position, label: "Fourth" },
	{ value: "LAST" as Position, label: "Last" },
];

export const MONTHS = [
	{ value: "JANUARY" as Month, label: "January" },
	{ value: "FEBRUARY" as Month, label: "February" },
	{ value: "MARCH" as Month, label: "March" },
	{ value: "APRIL" as Month, label: "April" },
	{ value: "MAY" as Month, label: "May" },
	{ value: "JUNE" as Month, label: "June" },
	{ value: "JULY" as Month, label: "July" },
	{ value: "AUGUST" as Month, label: "August" },
	{ value: "SEPTEMBER" as Month, label: "September" },
	{ value: "OCTOBER" as Month, label: "October" },
	{ value: "NOVEMBER" as Month, label: "November" },
	{ value: "DECEMBER" as Month, label: "December" },
];

export function monthNumberToEnum(monthNum: number): Month {
	return MONTHS[monthNum - 1].value; // Convert 1-based to 0-based index
}

export function monthEnumToNumber(month: Month): number {
	return MONTHS.findIndex((m) => m.value === month) + 1; // Convert 0-based to 1-based index
}

export interface MonthPosition {
	position: Position;
	dayOfWeek: DayOfWeek;
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
	months?: Month[]; // "JANUARY", "FEBRUARY", etc.

	// EXCLUDED DATES
	excludedDates?: string[]; // ISO date strings

	// METADATA
	description?: string;
}

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
