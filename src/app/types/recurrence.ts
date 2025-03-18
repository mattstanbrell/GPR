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
