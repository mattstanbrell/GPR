import { useState } from "react";
import type { Schema } from "../../../../amplify/data/resource";
import {
	calculateNextOccurrences,
	type DayOfWeek,
	type Frequency,
	type Month,
	DAYS_OF_WEEK,
	POSITIONS,
	MONTHS,
} from "@/app/types/recurrence";

interface RecurringPaymentSectionProps {
	form: Partial<Schema["Form"]["type"]>;
	handleFormChange: (field: string, value: unknown, updateDb?: boolean) => void;
	disabled: boolean;
}

// Utility function to toggle items in an array
function toggleArrayItem<T>(array: T[], item: T): T[] {
	return array.includes(item) ? array.filter((x) => x !== item) : [...array, item];
}

export function RecurringPaymentSection({ form, handleFormChange, disabled }: RecurringPaymentSectionProps) {
	const pattern = form.recurrencePattern;
	const [excludedDateInput, setExcludedDateInput] = useState("");

	// Compute values from pattern
	const getEndCondition = () =>
		pattern?.neverEnds ? "never" : pattern?.endDate ? "date" : pattern?.maxOccurrences ? "occurrences" : "never";

	const isMonthPosition = !!pattern?.monthPosition;
	const isMonthEnd = !!pattern?.monthEnd;

	// Handle day of week selection for weekly frequency
	const handleDayOfWeekChange = (d: string) => {
		const newDays = toggleArrayItem(pattern?.daysOfWeek || [], d);
		handleFormChange("recurrencePattern.daysOfWeek", newDays);
	};

	// Handle day of month selection for monthly frequency
	const handleDayOfMonthChange = (d: number) => {
		const newDays = toggleArrayItem(pattern?.dayOfMonth || [], d);
		handleFormChange("recurrencePattern.dayOfMonth", newDays);
	};

	// Handle month selection for yearly frequency
	const handleMonthChange = (month: string) => {
		const newMonths = toggleArrayItem(pattern?.months || [], month);
		handleFormChange("recurrencePattern.months", newMonths);
	};

	// Handle month position changes
	const handleMonthPositionChange = (field: "position" | "dayOfWeek", value: string) => {
		const currentPosition = pattern?.monthPosition || { position: "FIRST", dayOfWeek: "MONDAY" };
		handleFormChange("recurrencePattern.monthPosition", {
			...currentPosition,
			[field]: value,
		});
	};

	// Toggle monthly type selection
	const handleMonthlyTypeChange = (type: "day" | "position" | "end") => {
		if (type === "day") {
			handleFormChange("recurrencePattern.monthEnd", false);
			handleFormChange("recurrencePattern.monthPosition", undefined);
		} else if (type === "position") {
			handleFormChange("recurrencePattern.monthEnd", false);
			if (!pattern?.monthPosition) {
				handleFormChange("recurrencePattern.monthPosition", {
					position: "FIRST",
					dayOfWeek: "MONDAY",
				});
			}
		} else if (type === "end") {
			handleFormChange("recurrencePattern.monthEnd", true);
			handleFormChange("recurrencePattern.monthPosition", undefined);
		}
	};

	// Handle end condition changes
	const handleEndConditionChange = (condition: "never" | "date" | "occurrences") => {
		if (condition === "never") {
			handleFormChange("recurrencePattern.neverEnds", true);
			handleFormChange("recurrencePattern.endDate", undefined);
			handleFormChange("recurrencePattern.maxOccurrences", undefined);
		} else if (condition === "date") {
			handleFormChange("recurrencePattern.neverEnds", false);
			handleFormChange("recurrencePattern.maxOccurrences", undefined);
		} else if (condition === "occurrences") {
			handleFormChange("recurrencePattern.neverEnds", false);
			handleFormChange("recurrencePattern.endDate", undefined);
			if (!pattern?.maxOccurrences) {
				handleFormChange("recurrencePattern.maxOccurrences", 12);
			}
		}
	};

	// Handle excluded date addition
	const handleAddExcludedDate = () => {
		if (!excludedDateInput) return;
		if (!(pattern?.excludedDates || []).includes(excludedDateInput)) {
			handleFormChange("recurrencePattern.excludedDates", [...(pattern?.excludedDates || []), excludedDateInput]);
			setExcludedDateInput("");
		}
	};

	// Handle excluded date removal
	const handleRemoveExcludedDate = (date: string) => {
		handleFormChange(
			"recurrencePattern.excludedDates",
			(pattern?.excludedDates || []).filter((d) => d !== date),
		);
	};

	// Generate next occurrences preview
	const generateNextOccurrencesPreview = () => {
		if (!pattern?.startDate) {
			return ["Please set a start date to see occurrences"];
		}

		try {
			// Create a safe copy of the pattern with proper types
			const safePattern = {
				frequency: pattern.frequency as Frequency,
				interval: pattern.interval || 1,
				startDate: pattern.startDate,
				endDate: pattern.endDate && pattern.endDate !== null ? pattern.endDate : undefined,
				maxOccurrences: pattern.maxOccurrences && pattern.maxOccurrences !== null ? pattern.maxOccurrences : undefined,
				neverEnds: pattern.neverEnds || false,
				daysOfWeek: (pattern.daysOfWeek || []).filter((d): d is DayOfWeek => d !== null && d !== undefined),
				dayOfMonth: (pattern.dayOfMonth || []).filter((d): d is number => d !== null && d !== undefined),
				monthEnd: pattern.monthEnd ?? undefined,
				monthPosition:
					pattern?.monthPosition?.position && pattern?.monthPosition?.dayOfWeek
						? {
								position: pattern.monthPosition.position,
								dayOfWeek: pattern.monthPosition.dayOfWeek as DayOfWeek,
							}
						: undefined,
				months: (pattern.months || []).filter((m): m is Month => m !== null && m !== undefined),
				excludedDates: (pattern.excludedDates || []).filter((d): d is string => d !== null && d !== undefined),
				description: pattern.description ?? undefined,
			};

			const dates = calculateNextOccurrences(safePattern, 4);
			return dates.map((date) => date.toLocaleDateString("en-GB"));
		} catch (error) {
			console.error("Error calculating occurrences:", error);
			return ["Error calculating occurrences"];
		}
	};

	// Get human-readable pattern description
	const getPatternDescription = () => {
		if (!form.isRecurring) return "One-time payment";
		if (!pattern?.startDate) return "Please set a start date";

		const parts = [];

		// Add frequency and interval
		if (pattern.frequency && pattern.interval) {
			const frequency = pattern.frequency.toLowerCase();
			const interval = pattern.interval;

			// Convert frequency to singular form
			const frequencyMap: { [key: string]: string } = {
				daily: "day",
				weekly: "week",
				monthly: "month",
				yearly: "year",
			};

			const baseWord = frequencyMap[frequency] || frequency;
			parts.push(interval === 1 ? `Every ${baseWord}` : `Every ${interval} ${baseWord}s`);
		}

		// Add start date
		if (pattern.startDate) {
			parts.push(`starting ${new Date(pattern.startDate).toLocaleDateString()}`);
		}

		return parts.join(" ");
	};

	// Initialize recurrence pattern if needed
	const initializeRecurrencePattern = () => {
		if (!pattern) {
			const today = new Date().toISOString().split("T")[0];

			handleFormChange("recurrencePattern", {
				frequency: "MONTHLY" as const,
				interval: 1,
				startDate: today,
				neverEnds: true,
				daysOfWeek: [] as DayOfWeek[],
				dayOfMonth: [1] as number[],
				months: [
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
				] as Month[],
			});
		}
	};

	// Toggle recurring payment
	const handleRecurringToggle = (value: boolean) => {
		handleFormChange("isRecurring", value);
		if (value && !pattern) {
			initializeRecurrencePattern();
		}
	};

	// Handle changes to recurrence pattern fields
	const handlePatternChange = (field: string, value: unknown) => {
		handleFormChange(`recurrencePattern.${field}`, value);
	};

	return (
		<div className="govuk-form-group">
			<fieldset className="govuk-fieldset">
				<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">Payment Schedule</legend>

				<div className="govuk-radios">
					<div className="govuk-radios__item">
						<input
							className="govuk-radios__input"
							id="recurring-no"
							name="isRecurring"
							type="radio"
							value="no"
							checked={form.isRecurring === false}
							onChange={() => handleRecurringToggle(false)}
							disabled={disabled}
						/>
						<label className="govuk-label govuk-radios__label" htmlFor="recurring-no">
							One-time payment
						</label>
					</div>

					<div className="govuk-radios__item">
						<input
							className="govuk-radios__input"
							id="recurring-yes"
							name="isRecurring"
							type="radio"
							value="yes"
							checked={form.isRecurring === true}
							onChange={() => handleRecurringToggle(true)}
							disabled={disabled}
						/>
						<label className="govuk-label govuk-radios__label" htmlFor="recurring-yes">
							Recurring payment
						</label>
					</div>
				</div>
			</fieldset>

			{form.isRecurring && (
				<>
					<h3 className="govuk-heading-s" style={{ marginTop: "30px" }}>
						Recurrence Pattern
					</h3>

					<div className="govuk-form-group">
						<label className="govuk-label" htmlFor="frequency">
							Frequency
						</label>
						<select
							className="govuk-select"
							id="frequency"
							name="frequency"
							value={pattern?.frequency || "MONTHLY"}
							onChange={(e) => handlePatternChange("frequency", e.target.value)}
							disabled={disabled}
						>
							<option value="DAILY">Daily</option>
							<option value="WEEKLY">Weekly</option>
							<option value="MONTHLY">Monthly</option>
							<option value="YEARLY">Yearly</option>
						</select>
					</div>

					<div className="govuk-form-group">
						<label className="govuk-label" htmlFor="interval">
							Interval
						</label>
						<input
							className="govuk-input govuk-input--width-2"
							id="interval"
							name="interval"
							type="number"
							min="1"
							value={pattern?.interval || 1}
							onChange={(e) => handlePatternChange("interval", Number.parseInt(e.target.value, 10))}
							disabled={disabled}
							style={{ marginRight: "10px" }}
						/>
						<span className="govuk-hint">
							{(() => {
								const frequency = (pattern?.frequency || "MONTHLY").toLowerCase();
								const interval = pattern?.interval || 1;

								// Convert frequency to singular form
								const frequencyMap: { [key: string]: string } = {
									daily: "day",
									weekly: "week",
									monthly: "month",
									yearly: "year",
								};

								const baseWord = frequencyMap[frequency] || frequency;
								return interval === 1 ? `Every ${baseWord}` : `Every ${interval} ${baseWord}s`;
							})()}
						</span>
					</div>

					<div className="govuk-form-group">
						<label className="govuk-label" htmlFor="startDate">
							Start date
						</label>
						<input
							className="govuk-input govuk-input--width-10"
							id="startDate"
							name="startDate"
							type="date"
							value={pattern?.startDate || ""}
							onChange={(e) => handlePatternChange("startDate", e.target.value)}
							disabled={disabled}
						/>
					</div>

					{pattern?.frequency === "WEEKLY" && (
						<div className="govuk-form-group">
							<fieldset className="govuk-fieldset">
								<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Days of week</legend>
								<div className="govuk-checkboxes govuk-checkboxes--small">
									{DAYS_OF_WEEK.map((day) => (
										<div className="govuk-checkboxes__item" key={day.value}>
											<input
												className="govuk-checkboxes__input"
												id={`day-${day.value}`}
												type="checkbox"
												checked={(pattern?.daysOfWeek || []).includes(day.value)}
												onChange={() => handleDayOfWeekChange(day.value)}
												disabled={disabled}
											/>
											<label className="govuk-label govuk-checkboxes__label" htmlFor={`day-${day.value}`}>
												{day.label}
											</label>
										</div>
									))}
								</div>
							</fieldset>
						</div>
					)}

					{pattern?.frequency === "MONTHLY" && (
						<div className="govuk-form-group">
							<fieldset className="govuk-fieldset">
								<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Monthly options</legend>

								<div className="govuk-radios">
									<div className="govuk-radios__item">
										<input
											className="govuk-radios__input"
											id="monthly-day"
											name="monthlyType"
											type="radio"
											checked={!isMonthPosition && !isMonthEnd}
											onChange={() => handleMonthlyTypeChange("day")}
											disabled={disabled}
										/>
										<label className="govuk-label govuk-radios__label" htmlFor="monthly-day">
											Day(s) of month
										</label>
									</div>

									{!isMonthPosition && !isMonthEnd && (
										<div className="govuk-radios__conditional">
											<div className="govuk-form-group">
												<fieldset className="govuk-fieldset">
													<div
														className="govuk-checkboxes govuk-checkboxes--small"
														style={{ display: "flex", flexWrap: "wrap" }}
													>
														{Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
															<div className="govuk-checkboxes__item" key={day} style={{ width: "60px" }}>
																<input
																	className="govuk-checkboxes__input"
																	id={`day-of-month-${day}`}
																	type="checkbox"
																	checked={(pattern?.dayOfMonth || []).includes(day)}
																	onChange={() => handleDayOfMonthChange(day)}
																	disabled={disabled}
																/>
																<label className="govuk-label govuk-checkboxes__label" htmlFor={`day-of-month-${day}`}>
																	{day}
																</label>
															</div>
														))}
													</div>
												</fieldset>
											</div>
										</div>
									)}

									<div className="govuk-radios__item">
										<input
											className="govuk-radios__input"
											id="monthly-position"
											name="monthlyType"
											type="radio"
											checked={isMonthPosition}
											onChange={() => handleMonthlyTypeChange("position")}
											disabled={disabled}
										/>
										<label className="govuk-label govuk-radios__label" htmlFor="monthly-position">
											Specific day of month
										</label>
									</div>

									{isMonthPosition && (
										<div className="govuk-radios__conditional">
											<div className="govuk-form-group">
												<div style={{ display: "flex", gap: "10px" }}>
													<select
														className="govuk-select"
														value={pattern?.monthPosition?.position || "FIRST"}
														onChange={(e) => handleMonthPositionChange("position", e.target.value)}
														disabled={disabled}
													>
														{POSITIONS.map((pos) => (
															<option key={pos.value} value={pos.value}>
																{pos.label}
															</option>
														))}
													</select>
													<select
														className="govuk-select"
														value={pattern?.monthPosition?.dayOfWeek || "MONDAY"}
														onChange={(e) => handleMonthPositionChange("dayOfWeek", e.target.value)}
														disabled={disabled}
													>
														{DAYS_OF_WEEK.map((day) => (
															<option key={day.value} value={day.value}>
																{day.label}
															</option>
														))}
													</select>
												</div>
												<span className="govuk-hint">{'Example: "First Monday" of each month'}</span>
											</div>
										</div>
									)}

									<div className="govuk-radios__item">
										<input
											className="govuk-radios__input"
											id="monthly-end"
											name="monthlyType"
											type="radio"
											checked={isMonthEnd}
											onChange={() => handleMonthlyTypeChange("end")}
											disabled={disabled}
										/>
										<label className="govuk-label govuk-radios__label" htmlFor="monthly-end">
											Last day of month
										</label>
									</div>
								</div>
							</fieldset>
						</div>
					)}

					{(pattern?.frequency === "MONTHLY" || pattern?.frequency === "YEARLY") && (
						<div className="govuk-form-group">
							<fieldset className="govuk-fieldset">
								<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
									{pattern?.frequency === "MONTHLY" ? "Specific months" : "Months"}
								</legend>
								<div className="govuk-checkboxes govuk-checkboxes--small">
									{MONTHS.map((month) => (
										<div className="govuk-checkboxes__item" key={month.value}>
											<input
												className="govuk-checkboxes__input"
												id={`month-${month.value}`}
												type="checkbox"
												checked={(pattern?.months || []).includes(month.value)}
												onChange={() => handleMonthChange(month.value)}
												disabled={disabled}
											/>
											<label className="govuk-label govuk-checkboxes__label" htmlFor={`month-${month.value}`}>
												{month.label}
											</label>
										</div>
									))}
								</div>
								{pattern?.frequency === "YEARLY" && <div className="govuk-hint">Select one or more months</div>}
							</fieldset>
						</div>
					)}

					<div className="govuk-form-group">
						<fieldset className="govuk-fieldset">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">End condition</legend>
							<div className="govuk-radios">
								<div className="govuk-radios__item">
									<input
										className="govuk-radios__input"
										id="end-never"
										name="endCondition"
										type="radio"
										value="never"
										checked={getEndCondition() === "never"}
										onChange={() => handleEndConditionChange("never")}
										disabled={disabled}
									/>
									<label className="govuk-label govuk-radios__label" htmlFor="end-never">
										Never ends
									</label>
								</div>

								<div className="govuk-radios__item">
									<input
										className="govuk-radios__input"
										id="end-date"
										name="endCondition"
										type="radio"
										value="date"
										checked={getEndCondition() === "date"}
										onChange={() => handleEndConditionChange("date")}
										disabled={disabled}
									/>
									<label className="govuk-label govuk-radios__label" htmlFor="end-date">
										End by date
									</label>
								</div>

								{getEndCondition() === "date" && (
									<div className="govuk-radios__conditional">
										<div className="govuk-form-group">
											<label className="govuk-label" htmlFor="endDate">
												End date
											</label>
											<input
												className="govuk-input govuk-input--width-10"
												id="endDate"
												name="endDate"
												type="date"
												value={pattern?.endDate || ""}
												onChange={(e) => handlePatternChange("endDate", e.target.value)}
												disabled={disabled}
											/>
										</div>
									</div>
								)}

								<div className="govuk-radios__item">
									<input
										className="govuk-radios__input"
										id="end-occurrences"
										name="endCondition"
										type="radio"
										value="occurrences"
										checked={getEndCondition() === "occurrences"}
										onChange={() => handleEndConditionChange("occurrences")}
										disabled={disabled}
									/>
									<label className="govuk-label govuk-radios__label" htmlFor="end-occurrences">
										End after X occurrences
									</label>
								</div>

								{getEndCondition() === "occurrences" && (
									<div className="govuk-radios__conditional">
										<div className="govuk-form-group">
											<label className="govuk-label" htmlFor="maxOccurrences">
												Number of occurrences
											</label>
											<input
												className="govuk-input govuk-input--width-4"
												id="maxOccurrences"
												name="maxOccurrences"
												type="number"
												min="1"
												value={pattern?.maxOccurrences || 12}
												onChange={(e) => handlePatternChange("maxOccurrences", Number.parseInt(e.target.value, 10))}
												disabled={disabled}
											/>
										</div>
									</div>
								)}
							</div>
						</fieldset>
					</div>

					<div className="govuk-form-group" style={{ marginBottom: "15px" }}>
						<fieldset className="govuk-fieldset">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Excluded dates</legend>
							<div className="govuk-hint">Dates to skip in the recurrence pattern</div>

							<div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
								<input
									className="govuk-input govuk-input--width-10"
									type="date"
									value={excludedDateInput}
									onChange={(e) => setExcludedDateInput(e.target.value)}
									disabled={disabled}
								/>
								<button
									type="button"
									className="govuk-button govuk-button--secondary"
									onClick={handleAddExcludedDate}
									disabled={disabled || !excludedDateInput}
								>
									Add
								</button>
							</div>

							{(pattern?.excludedDates || []).length > 0 && (
								<div className="govuk-inset-text">
									<h4 className="govuk-heading-s">Excluded dates:</h4>
									<ul className="govuk-list">
										{(pattern?.excludedDates || [])
											.filter((date): date is string => !!date)
											.map((date) => {
												// Safely create a date object
												const dateObj = new Date(date);
												const formattedDate = !Number.isNaN(dateObj.getTime())
													? dateObj.toLocaleDateString("en-GB")
													: "Invalid date";

												return (
													<li
														key={`excluded-${date}`}
														style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
													>
														{formattedDate}
														<button
															type="button"
															className="govuk-button govuk-button--secondary govuk-button--small"
															onClick={() => handleRemoveExcludedDate(date)}
															disabled={disabled}
														>
															Remove
														</button>
													</li>
												);
											})}
									</ul>
								</div>
							)}
						</fieldset>
					</div>

					<div className="govuk-form-group">
						<label className="govuk-label" htmlFor="description">
							Description (optional)
						</label>
						<input
							className="govuk-input"
							id="description"
							name="description"
							type="text"
							value={pattern?.description || ""}
							onChange={(e) => handlePatternChange("description", e.target.value)}
							disabled={disabled}
						/>
					</div>

					<div className="govuk-inset-text">
						<p>{getPatternDescription()}</p>
						<br />
						<h4 className="govuk-heading-s">Next 4 occurrences:</h4>
						<ul className="govuk-list govuk-list--bullet">
							{generateNextOccurrencesPreview().map((date) => (
								<li key={`occurrence-${date}`}>{date}</li>
							))}
						</ul>
					</div>
				</>
			)}
		</div>
	);
}
