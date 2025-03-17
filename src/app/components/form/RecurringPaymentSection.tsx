import { useState } from "react";
import type { Schema } from "../../../../amplify/data/resource";
import {
	calculateNextOccurrences,
	type DayOfWeek,
	type Position,
	type Frequency,
	type Month,
} from "@/app/types/recurrence";

interface RecurringPaymentSectionProps {
	form: Partial<Schema["Form"]["type"]>;
	handleFormChange: (field: string, value: unknown, updateDb?: boolean) => void;
	disabled: boolean;
}

export function RecurringPaymentSection({ form, handleFormChange, disabled }: RecurringPaymentSectionProps) {
	// Define days of week and positions for dropdowns
	const daysOfWeek: { value: DayOfWeek; label: string }[] = [
		{ value: "MONDAY", label: "Monday" },
		{ value: "TUESDAY", label: "Tuesday" },
		{ value: "WEDNESDAY", label: "Wednesday" },
		{ value: "THURSDAY", label: "Thursday" },
		{ value: "FRIDAY", label: "Friday" },
		{ value: "SATURDAY", label: "Saturday" },
		{ value: "SUNDAY", label: "Sunday" },
	];

	const positions: { value: Position; label: string }[] = [
		{ value: "FIRST", label: "First" },
		{ value: "SECOND", label: "Second" },
		{ value: "THIRD", label: "Third" },
		{ value: "FOURTH", label: "Fourth" },
		{ value: "LAST", label: "Last" },
	];

	const months: { value: string; label: string }[] = [
		{ value: "JANUARY", label: "January" },
		{ value: "FEBRUARY", label: "February" },
		{ value: "MARCH", label: "March" },
		{ value: "APRIL", label: "April" },
		{ value: "MAY", label: "May" },
		{ value: "JUNE", label: "June" },
		{ value: "JULY", label: "July" },
		{ value: "AUGUST", label: "August" },
		{ value: "SEPTEMBER", label: "September" },
		{ value: "OCTOBER", label: "October" },
		{ value: "NOVEMBER", label: "November" },
		{ value: "DECEMBER", label: "December" },
	];

	// UI state for the component
	const [excludedDateInput, setExcludedDateInput] = useState("");
	const [endCondition, setEndCondition] = useState<"never" | "date" | "occurrences">(
		form.recurrencePattern?.neverEnds
			? "never"
			: form.recurrencePattern?.endDate
				? "date"
				: form.recurrencePattern?.maxOccurrences
					? "occurrences"
					: "never",
	);
	const [useMonthPosition, setUseMonthPosition] = useState(!!form.recurrencePattern?.monthPosition);

	// Handle day of week selection for weekly frequency
	const handleDayOfWeekChange = (d: string) => {
		const currentDays = form.recurrencePattern?.daysOfWeek || [];
		const newDays = currentDays.includes(d) ? currentDays.filter((day) => day !== d) : [...currentDays, d];
		handleFormChange("recurrencePattern.daysOfWeek", newDays);
	};

	// Handle day of month selection for monthly frequency
	const handleDayOfMonthChange = (d: number) => {
		const currentDays = form.recurrencePattern?.dayOfMonth || [];
		const newDays = currentDays.includes(d) ? currentDays.filter((day) => day !== d) : [...currentDays, d];
		handleFormChange("recurrencePattern.dayOfMonth", newDays);
	};

	// Handle month selection for yearly frequency
	const handleMonthChange = (month: string) => {
		const currentMonths = form.recurrencePattern?.months || [];
		const newMonths = currentMonths.includes(month)
			? currentMonths.filter((m) => m !== month)
			: [...currentMonths, month];
		handleFormChange("recurrencePattern.months", newMonths);
	};

	// Handle month position changes
	const handleMonthPositionChange = (field: "position" | "dayOfWeek", value: string) => {
		const currentPosition = form.recurrencePattern?.monthPosition || { position: "FIRST", dayOfWeek: "MONDAY" };

		handleFormChange("recurrencePattern.monthPosition", {
			...currentPosition,
			[field]: value,
		});
	};

	// Toggle monthly type selection
	const handleMonthlyTypeChange = (type: "day" | "position" | "end") => {
		if (type === "day") {
			setUseMonthPosition(false);
			handleFormChange("recurrencePattern.monthEnd", false);
			handleFormChange("recurrencePattern.monthPosition", undefined);
		} else if (type === "position") {
			setUseMonthPosition(true);
			handleFormChange("recurrencePattern.monthEnd", false);

			// Ensure monthPosition is set
			if (!form.recurrencePattern?.monthPosition) {
				handleFormChange("recurrencePattern.monthPosition", {
					position: "FIRST",
					dayOfWeek: "MONDAY",
				});
			}
		} else if (type === "end") {
			setUseMonthPosition(false);
			handleFormChange("recurrencePattern.monthEnd", true);
			handleFormChange("recurrencePattern.monthPosition", undefined);
		}
	};

	// Handle end condition changes
	const handleEndConditionChange = (condition: "never" | "date" | "occurrences") => {
		setEndCondition(condition);

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
			if (!form.recurrencePattern?.maxOccurrences) {
				handleFormChange("recurrencePattern.maxOccurrences", 12);
			}
		}
	};

	// Handle excluded date addition
	const handleAddExcludedDate = () => {
		if (!excludedDateInput) return;

		const currentExcludedDates = form.recurrencePattern?.excludedDates || [];
		if (!currentExcludedDates.includes(excludedDateInput)) {
			handleFormChange("recurrencePattern.excludedDates", [...currentExcludedDates, excludedDateInput]);
			setExcludedDateInput("");
		}
	};

	// Handle excluded date removal
	const handleRemoveExcludedDate = (date: string) => {
		const currentExcludedDates = form.recurrencePattern?.excludedDates || [];
		handleFormChange(
			"recurrencePattern.excludedDates",
			currentExcludedDates.filter((d) => d !== date),
		);
	};

	// Generate next occurrences preview
	const generateNextOccurrencesPreview = () => {
		if (!form.recurrencePattern?.startDate) {
			return ["Please set a start date to see occurrences"];
		}

		try {
			// Create a safe copy of the pattern with proper types
			const safePattern = {
				frequency: form.recurrencePattern.frequency as Frequency,
				interval: form.recurrencePattern.interval || 1,
				startDate: form.recurrencePattern.startDate,
				endDate:
					form.recurrencePattern.endDate && form.recurrencePattern.endDate !== null
						? form.recurrencePattern.endDate
						: undefined,
				maxOccurrences:
					form.recurrencePattern.maxOccurrences && form.recurrencePattern.maxOccurrences !== null
						? form.recurrencePattern.maxOccurrences
						: undefined,
				neverEnds: form.recurrencePattern.neverEnds || false,
				daysOfWeek: (form.recurrencePattern.daysOfWeek || []).filter(
					(d): d is DayOfWeek => d !== null && d !== undefined,
				),
				dayOfMonth: (form.recurrencePattern.dayOfMonth || []).filter((d): d is number => d !== null && d !== undefined),
				monthEnd: form.recurrencePattern.monthEnd ?? undefined,
				monthPosition:
					form.recurrencePattern?.monthPosition?.position && form.recurrencePattern?.monthPosition?.dayOfWeek
						? {
								position: form.recurrencePattern.monthPosition.position,
								dayOfWeek: form.recurrencePattern.monthPosition.dayOfWeek as DayOfWeek,
							}
						: undefined,
				months: (form.recurrencePattern.months || []).filter((m): m is Month => m !== null && m !== undefined),
				excludedDates: (form.recurrencePattern.excludedDates || []).filter(
					(d): d is string => d !== null && d !== undefined,
				),
				description: form.recurrencePattern.description ?? undefined,
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
		if (!form.recurrencePattern?.startDate) return "Please set a start date";

		const parts = [];

		// Add frequency and interval
		if (form.recurrencePattern?.frequency && form.recurrencePattern?.interval) {
			parts.push(`Every ${form.recurrencePattern.interval} ${form.recurrencePattern.frequency.toLowerCase()}`);
		}

		// Add start date
		if (form.recurrencePattern?.startDate) {
			parts.push(`starting ${new Date(form.recurrencePattern.startDate).toLocaleDateString()}`);
		}

		return parts.join(" ");
	};

	// Initialize recurrence pattern if needed
	const initializeRecurrencePattern = () => {
		if (!form.recurrencePattern) {
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
		if (value && !form.recurrencePattern) {
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
							value={form.recurrencePattern?.frequency || "MONTHLY"}
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
							value={form.recurrencePattern?.interval || 1}
							onChange={(e) => handlePatternChange("interval", Number.parseInt(e.target.value, 10))}
							disabled={disabled}
							style={{ marginRight: "10px" }}
						/>
						<span className="govuk-hint">
							{(() => {
								const frequency = (form.recurrencePattern?.frequency || "MONTHLY").toLowerCase();
								const interval = form.recurrencePattern?.interval || 1;

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
							value={form.recurrencePattern?.startDate || ""}
							onChange={(e) => handlePatternChange("startDate", e.target.value)}
							disabled={disabled}
						/>
					</div>

					{form.recurrencePattern?.frequency === "WEEKLY" && (
						<div className="govuk-form-group">
							<fieldset className="govuk-fieldset">
								<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Days of week</legend>
								<div className="govuk-checkboxes govuk-checkboxes--small">
									{daysOfWeek.map((day) => (
										<div className="govuk-checkboxes__item" key={day.value}>
											<input
												className="govuk-checkboxes__input"
												id={`day-${day.value}`}
												type="checkbox"
												checked={(form.recurrencePattern?.daysOfWeek || []).includes(day.value)}
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

					{form.recurrencePattern?.frequency === "MONTHLY" && (
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
											checked={!useMonthPosition && !(form.recurrencePattern?.monthEnd || false)}
											onChange={() => handleMonthlyTypeChange("day")}
											disabled={disabled}
										/>
										<label className="govuk-label govuk-radios__label" htmlFor="monthly-day">
											Day(s) of month
										</label>
									</div>

									{!useMonthPosition && !(form.recurrencePattern?.monthEnd || false) && (
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
																	checked={(form.recurrencePattern?.dayOfMonth || []).includes(day)}
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
											checked={useMonthPosition}
											onChange={() => handleMonthlyTypeChange("position")}
											disabled={disabled}
										/>
										<label className="govuk-label govuk-radios__label" htmlFor="monthly-position">
											Specific day of month
										</label>
									</div>

									{useMonthPosition && (
										<div className="govuk-radios__conditional">
											<div className="govuk-form-group">
												<div style={{ display: "flex", gap: "10px" }}>
													<select
														className="govuk-select"
														value={form.recurrencePattern?.monthPosition?.position || "FIRST"}
														onChange={(e) => handleMonthPositionChange("position", e.target.value)}
														disabled={disabled}
													>
														{positions.map((pos) => (
															<option key={pos.value} value={pos.value}>
																{pos.label}
															</option>
														))}
													</select>
													<select
														className="govuk-select"
														value={form.recurrencePattern?.monthPosition?.dayOfWeek || "MONDAY"}
														onChange={(e) => handleMonthPositionChange("dayOfWeek", e.target.value)}
														disabled={disabled}
													>
														{daysOfWeek.map((day) => (
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
											checked={form.recurrencePattern?.monthEnd || false}
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

					{(form.recurrencePattern?.frequency === "MONTHLY" || form.recurrencePattern?.frequency === "YEARLY") && (
						<div className="govuk-form-group">
							<fieldset className="govuk-fieldset">
								<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
									{form.recurrencePattern?.frequency === "MONTHLY" ? "Specific months" : "Months"}
								</legend>
								<div className="govuk-checkboxes govuk-checkboxes--small">
									{months.map((month) => (
										<div className="govuk-checkboxes__item" key={month.value}>
											<input
												className="govuk-checkboxes__input"
												id={`month-${month.value}`}
												type="checkbox"
												checked={(form.recurrencePattern?.months || []).includes(month.value)}
												onChange={() => handleMonthChange(month.value)}
												disabled={disabled}
											/>
											<label className="govuk-label govuk-checkboxes__label" htmlFor={`month-${month.value}`}>
												{month.label}
											</label>
										</div>
									))}
								</div>
								{form.recurrencePattern?.frequency === "YEARLY" && (
									<div className="govuk-hint">Select one or more months</div>
								)}
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
										checked={endCondition === "never"}
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
										checked={endCondition === "date"}
										onChange={() => handleEndConditionChange("date")}
										disabled={disabled}
									/>
									<label className="govuk-label govuk-radios__label" htmlFor="end-date">
										End by date
									</label>
								</div>

								{endCondition === "date" && (
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
												value={form.recurrencePattern?.endDate || ""}
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
										checked={endCondition === "occurrences"}
										onChange={() => handleEndConditionChange("occurrences")}
										disabled={disabled}
									/>
									<label className="govuk-label govuk-radios__label" htmlFor="end-occurrences">
										End after X occurrences
									</label>
								</div>

								{endCondition === "occurrences" && (
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
												value={form.recurrencePattern?.maxOccurrences || 12}
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

							{(form.recurrencePattern?.excludedDates || []).length > 0 && (
								<div className="govuk-inset-text">
									<h4 className="govuk-heading-s">Excluded dates:</h4>
									<ul className="govuk-list">
										{(form.recurrencePattern?.excludedDates || [])
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
							value={form.recurrencePattern?.description || ""}
							onChange={(e) => handlePatternChange("description", e.target.value)}
							disabled={disabled}
						/>
					</div>

					<div className="govuk-inset-text">
						<h3 className="govuk-heading-s">Pattern summary</h3>
						<p>{getPatternDescription()}</p>

						<h4 className="govuk-heading-s">Next occurrences:</h4>
						<ul className="govuk-list govuk-list--bullet">
							{generateNextOccurrencesPreview().map((date) => (
								<li key={`occurrence-${date}`}>{date}</li>
							))}
						</ul>
						<p className="govuk-hint">(Showing next 4 occurrences)</p>
					</div>
				</>
			)}
		</div>
	);
}
