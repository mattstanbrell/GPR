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
	day_of_week: DayOfWeek;
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
	start_date: string; // ISO date string

	// OPTIONAL END CONDITIONS (choose one or none)
	end_date?: string; // ISO date string
	max_occurrences?: number;
	never_ends?: boolean;

	// WEEKLY RECURRENCE SPECIFIERS
	days_of_week?: DayOfWeek[];

	// MONTHLY RECURRENCE SPECIFIERS
	day_of_month?: number[]; // Array of days (1-31)
	month_end?: boolean;
	month_position?: MonthPosition;

	// YEARLY RECURRENCE SPECIFIERS
	months?: (Month | number)[]; // Can be Month enum or number 1-12
	day_of_year?: number; // 1-366
	year_position?: YearPosition;

	// EXCLUDED DATES
	excluded_dates?: string[]; // ISO date strings

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
	const { frequency, interval } = pattern;

	let description = "";

	// Base frequency and interval
	if (interval === 1) {
		if (frequency === "DAILY") description = "Every day";
		if (frequency === "WEEKLY") description = "Every week";
		if (frequency === "MONTHLY") description = "Every month";
		if (frequency === "YEARLY") description = "Every year";
	} else {
		if (frequency === "DAILY") description = `Every ${interval} days`;
		if (frequency === "WEEKLY") description = `Every ${interval} weeks`;
		if (frequency === "MONTHLY") description = `Every ${interval} months`;
		if (frequency === "YEARLY") description = `Every ${interval} years`;
	}

	// Add day specifics for weekly
	if (frequency === "WEEKLY" && pattern.days_of_week && pattern.days_of_week.length > 0) {
		const daysCapitalized = pattern.days_of_week.map((day) => day.charAt(0) + day.slice(1).toLowerCase());

		if (pattern.days_of_week.length === 7) {
			description += " on every day";
		} else if (
			pattern.days_of_week.length === 5 &&
			pattern.days_of_week.includes("MONDAY") &&
			pattern.days_of_week.includes("TUESDAY") &&
			pattern.days_of_week.includes("WEDNESDAY") &&
			pattern.days_of_week.includes("THURSDAY") &&
			pattern.days_of_week.includes("FRIDAY")
		) {
			description += " on weekdays";
		} else if (
			pattern.days_of_week.length === 2 &&
			pattern.days_of_week.includes("SATURDAY") &&
			pattern.days_of_week.includes("SUNDAY")
		) {
			description += " on weekends";
		} else {
			description += ` on ${daysCapitalized.join(", ")}`;
		}
	}

	// Add day specifics for monthly
	if (frequency === "MONTHLY") {
		if (pattern.day_of_month && pattern.day_of_month.length > 0) {
			if (pattern.day_of_month.length === 1) {
				description += ` on day ${pattern.day_of_month[0]}`;
			} else {
				description += ` on days ${pattern.day_of_month.join(", ")}`;
			}
		}

		if (pattern.month_end) {
			description += " on the last day";
		}

		if (pattern.month_position) {
			const { position, day_of_week } = pattern.month_position;
			const positionText = position.toLowerCase();
			const dayText = day_of_week.charAt(0) + day_of_week.slice(1).toLowerCase();
			description += ` on the ${positionText} ${dayText}`;
		}
	}

	// Add specifics for yearly
	if (frequency === "YEARLY") {
		if (pattern.months && pattern.months.length > 0) {
			const monthNames = pattern.months.map((month) => {
				if (typeof month === "number") {
					return new Date(2000, month - 1, 1).toLocaleString("default", { month: "long" });
				}
				return month.charAt(0) + month.slice(1).toLowerCase();
			});

			if (pattern.months.length === 1) {
				description += ` in ${monthNames[0]}`;
			} else {
				description += ` in ${monthNames.join(", ")}`;
			}
		}

		if (pattern.day_of_year) {
			const date = new Date(2000, 0, pattern.day_of_year);
			const monthName = date.toLocaleString("default", { month: "long" });
			const day = date.getDate();
			description += ` on ${monthName} ${day}`;
		}

		if (pattern.year_position) {
			const { position, day_of_week, month } = pattern.year_position;
			const positionText = position.toLowerCase();
			const dayText = day_of_week.charAt(0) + day_of_week.slice(1).toLowerCase();

			let monthText = "";
			if (typeof month === "number") {
				monthText = new Date(2000, month - 1, 1).toLocaleString("default", { month: "long" });
			} else {
				monthText = month.charAt(0) + month.slice(1).toLowerCase();
			}

			description += ` on the ${positionText} ${dayText} of ${monthText}`;
		}
	}

	// Add end condition
	if (pattern.end_date) {
		const endDate = new Date(pattern.end_date);
		const formattedDate = endDate.toLocaleDateString();
		description += ` until ${formattedDate}`;
	} else if (pattern.max_occurrences) {
		description += ` for ${pattern.max_occurrences} occurrences`;
	} else if (pattern.never_ends) {
		description += " with no end date";
	}

	return description;
}

// Function to calculate the next N occurrences of a recurrence pattern
export function calculateNextOccurrences(pattern: RecurrencePattern, count = 5): Date[] {
	// This is a simplified implementation
	// A production version would need to handle all the complex recurrence rules

	const occurrences: Date[] = [];
	const startDate = new Date(pattern.start_date);

	if (Number.isNaN(startDate.getTime())) {
		return occurrences; // Invalid start date
	}

	const currentDate = new Date(startDate);

	while (occurrences.length < count) {
		// Check if we've reached the end date
		if (pattern.end_date) {
			const endDate = new Date(pattern.end_date);
			if (currentDate > endDate) break;
		}

		// Check if we've reached max occurrences
		if (pattern.max_occurrences && occurrences.length >= pattern.max_occurrences) {
			break;
		}

		// Check if date is excluded
		const isExcluded =
			pattern.excluded_dates?.some((excludedDate) => {
				const excluded = new Date(excludedDate);
				return (
					excluded.getDate() === currentDate.getDate() &&
					excluded.getMonth() === currentDate.getMonth() &&
					excluded.getFullYear() === currentDate.getFullYear()
				);
			}) || false;

		// Check if this date matches the pattern
		const matches = (() => {
			if (isExcluded) return false;

			switch (pattern.frequency) {
				case "DAILY":
					// For daily, every day matches (except excluded dates)
					return true;

				case "WEEKLY": {
					// For weekly, check if the current day of week is in the days_of_week array
					if (!pattern.days_of_week || pattern.days_of_week.length === 0) {
						// If no days specified, use the day of week from the start date
						const startDayOfWeek = startDate.getDay();
						return currentDate.getDay() === startDayOfWeek;
					}

					const dayOfWeekMap: Record<number, DayOfWeek> = {
						0: "SUNDAY",
						1: "MONDAY",
						2: "TUESDAY",
						3: "WEDNESDAY",
						4: "THURSDAY",
						5: "FRIDAY",
						6: "SATURDAY",
					};

					const currentDayOfWeek = dayOfWeekMap[currentDate.getDay()];
					return pattern.days_of_week.includes(currentDayOfWeek);
				}

				case "MONTHLY": {
					// For monthly, check day of month or month position
					if (pattern.day_of_month && pattern.day_of_month.length > 0) {
						return pattern.day_of_month.includes(currentDate.getDate());
					}

					if (pattern.month_end) {
						// Check if it's the last day of the month
						const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
						return currentDate.getDate() === lastDay;
					}

					if (pattern.month_position) {
						const { position, day_of_week } = pattern.month_position;
						const dayOfWeekMap: Record<DayOfWeek, number> = {
							SUNDAY: 0,
							MONDAY: 1,
							TUESDAY: 2,
							WEDNESDAY: 3,
							THURSDAY: 4,
							FRIDAY: 5,
							SATURDAY: 6,
						};

						// Check if current date is the specified day of week
						if (currentDate.getDay() !== dayOfWeekMap[day_of_week]) {
							return false;
						}

						// Calculate which occurrence this is
						const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
						const dayOfWeekIndex = dayOfWeekMap[day_of_week];

						// Find the first occurrence of this day in the month
						const firstOccurrence = 1 + ((7 + dayOfWeekIndex - firstDayOfMonth.getDay()) % 7);

						// Calculate the occurrence number (1-based)
						const occurrenceNumber = Math.ceil((currentDate.getDate() - firstOccurrence + 1) / 7);

						if (position === "LAST") {
							// Check if it's the last occurrence of this day in the month
							const nextWeek = new Date(currentDate);
							nextWeek.setDate(currentDate.getDate() + 7);
							return nextWeek.getMonth() !== currentDate.getMonth();
						}

						const positionMap: Record<Position, number> = {
							FIRST: 1,
							SECOND: 2,
							THIRD: 3,
							FOURTH: 4,
							LAST: -1, // Handled separately
						};

						return occurrenceNumber === positionMap[position];
					}

					// If no monthly specifiers, use the day from the start date
					return currentDate.getDate() === startDate.getDate();
				}

				case "YEARLY": {
					// For yearly, check month and day
					const currentMonth = currentDate.getMonth() + 1; // 1-based month

					// Check if the current month is in the months array
					if (pattern.months && pattern.months.length > 0) {
						const monthMatches = pattern.months.some((month) => {
							if (typeof month === "number") {
								return month === currentMonth;
							}
							// Convert Month enum to number (1-12)
							return monthEnumToNumber(month) === currentMonth;
						});

						if (!monthMatches) return false;
					}

					// If day_of_year is specified, check that
					if (pattern.day_of_year) {
						const dayOfYear = getDayOfYear(currentDate);
						return dayOfYear === pattern.day_of_year;
					}

					// If year_position is specified, check that
					if (pattern.year_position) {
						const { position, day_of_week, month } = pattern.year_position;

						// Check if we're in the right month
						let targetMonth: number;
						if (typeof month === "number") {
							targetMonth = month;
						} else {
							targetMonth = monthEnumToNumber(month);
						}

						if (currentMonth !== targetMonth) {
							return false;
						}

						// The rest is similar to monthly position check
						const dayOfWeekMap: Record<DayOfWeek, number> = {
							SUNDAY: 0,
							MONDAY: 1,
							TUESDAY: 2,
							WEDNESDAY: 3,
							THURSDAY: 4,
							FRIDAY: 5,
							SATURDAY: 6,
						};

						// Check if current date is the specified day of week
						if (currentDate.getDay() !== dayOfWeekMap[day_of_week]) {
							return false;
						}

						// Calculate which occurrence this is
						const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
						const dayOfWeekIndex = dayOfWeekMap[day_of_week];

						// Find the first occurrence of this day in the month
						const firstOccurrence = 1 + ((7 + dayOfWeekIndex - firstDayOfMonth.getDay()) % 7);

						// Calculate the occurrence number (1-based)
						const occurrenceNumber = Math.ceil((currentDate.getDate() - firstOccurrence + 1) / 7);

						if (position === "LAST") {
							// Check if it's the last occurrence of this day in the month
							const nextWeek = new Date(currentDate);
							nextWeek.setDate(currentDate.getDate() + 7);
							return nextWeek.getMonth() !== currentDate.getMonth();
						}

						const positionMap: Record<Position, number> = {
							FIRST: 1,
							SECOND: 2,
							THIRD: 3,
							FOURTH: 4,
							LAST: -1, // Handled separately
						};

						return occurrenceNumber === positionMap[position];
					}

					// If no yearly specifiers, use the month and day from the start date
					return currentDate.getMonth() === startDate.getMonth() && currentDate.getDate() === startDate.getDate();
				}

				default:
					return false;
			}
		})();

		if (matches && !isExcluded) {
			occurrences.push(new Date(currentDate));
		}

		// Advance to next potential date
		switch (pattern.frequency) {
			case "DAILY": {
				currentDate.setDate(currentDate.getDate() + pattern.interval);
				break;
			}
			case "WEEKLY": {
				currentDate.setDate(currentDate.getDate() + 1);
				break;
			}
			case "MONTHLY": {
				if (occurrences.length > 0 || !matches) {
					// Only increment month if we've already found a match or this date doesn't match
					currentDate.setMonth(currentDate.getMonth() + pattern.interval);
					// Reset to first day of month to avoid skipping months with fewer days
					currentDate.setDate(1);
				} else {
					// If we haven't found a match yet, just go to the next day
					currentDate.setDate(currentDate.getDate() + 1);
				}
				break;
			}
			case "YEARLY": {
				if (occurrences.length > 0 || !matches) {
					// Only increment year if we've already found a match or this date doesn't match
					currentDate.setFullYear(currentDate.getFullYear() + pattern.interval);
					// Reset to first day of year to avoid issues with leap years
					currentDate.setMonth(0);
					currentDate.setDate(1);
				} else {
					// If we haven't found a match yet, just go to the next day
					currentDate.setDate(currentDate.getDate() + 1);
				}
				break;
			}
		}
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
