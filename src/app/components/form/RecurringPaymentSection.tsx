import { useState, ChangeEvent } from "react";
import type { Schema } from "../../../../amplify/data/resource";
import {
	calculateNextOccurrences,
	generateRecurrenceDescription,
	type DayOfWeek,
	type Position,
	type Month,
	type Frequency,
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

	const months: { value: number; label: string }[] = [
		{ value: 1, label: "January" },
		{ value: 2, label: "February" },
		{ value: 3, label: "March" },
		{ value: 4, label: "April" },
		{ value: 5, label: "May" },
		{ value: 6, label: "June" },
		{ value: 7, label: "July" },
		{ value: 8, label: "August" },
		{ value: 9, label: "September" },
		{ value: 10, label: "October" },
		{ value: 11, label: "November" },
		{ value: 12, label: "December" },
	];

	// UI state for the component
	const [excludedDateInput, setExcludedDateInput] = useState("");
	const [endCondition, setEndCondition] = useState<"never" | "date" | "occurrences">(
		form.recurrence_pattern?.never_ends
			? "never"
			: form.recurrence_pattern?.end_date
				? "date"
				: form.recurrence_pattern?.max_occurrences
					? "occurrences"
					: "never",
	);
	const [useMonthPosition, setUseMonthPosition] = useState(!!form.recurrence_pattern?.month_position);

	// Handle day of week selection for weekly frequency
	const handleDayOfWeekChange = (day: DayOfWeek) => {
		// Filter out any null values and ensure we have a DayOfWeek[] array
		const currentDays = (form.recurrence_pattern?.days_of_week || []).filter(
			(d): d is DayOfWeek => d !== null && d !== undefined,
		);

		let newDays: DayOfWeek[];

		if (currentDays.includes(day)) {
			newDays = currentDays.filter((d) => d !== day);
		} else {
			newDays = [...currentDays, day];
		}

		handleFormChange("recurrence_pattern.days_of_week", newDays);
	};

	// Handle day of month selection for monthly frequency
	const handleDayOfMonthChange = (day: number) => {
		// Filter out any null values and ensure we have a number[] array
		const currentDays = (form.recurrence_pattern?.day_of_month || []).filter(
			(d): d is number => d !== null && d !== undefined,
		);

		let newDays: number[];

		if (currentDays.includes(day)) {
			newDays = currentDays.filter((d) => d !== day);
		} else {
			newDays = [...currentDays, day];
		}

		handleFormChange("recurrence_pattern.day_of_month", newDays);
	};

	// Handle month selection for yearly frequency
	const handleMonthChange = (monthNum: number) => {
		// Filter out any null values and ensure we have a number[] array
		const currentMonths = (form.recurrence_pattern?.months || []).filter(
			(m): m is number => m !== null && m !== undefined,
		);

		let newMonths: number[];

		if (currentMonths.includes(monthNum)) {
			newMonths = currentMonths.filter((m) => m !== monthNum);
		} else {
			newMonths = [...currentMonths, monthNum];
		}

		handleFormChange("recurrence_pattern.months", newMonths);
	};

	// Handle month position changes
	const handleMonthPositionChange = (field: "position" | "day_of_week", value: string) => {
		const currentPosition = form.recurrence_pattern?.month_position || { position: "FIRST", day_of_week: "MONDAY" };

		handleFormChange("recurrence_pattern.month_position", {
			...currentPosition,
			[field]: value,
		});
	};

	// Toggle monthly type selection
	const handleMonthlyTypeChange = (type: "day" | "position" | "end") => {
		if (type === "day") {
			setUseMonthPosition(false);
			handleFormChange("recurrence_pattern.month_end", false);
			handleFormChange("recurrence_pattern.month_position", undefined);
		} else if (type === "position") {
			setUseMonthPosition(true);
			handleFormChange("recurrence_pattern.month_end", false);

			// Ensure month_position is set
			if (!form.recurrence_pattern?.month_position) {
				handleFormChange("recurrence_pattern.month_position", {
					position: "FIRST",
					day_of_week: "MONDAY",
				});
			}
		} else if (type === "end") {
			setUseMonthPosition(false);
			handleFormChange("recurrence_pattern.month_end", true);
			handleFormChange("recurrence_pattern.month_position", undefined);
		}
	};

	// Handle end condition changes
	const handleEndConditionChange = (condition: "never" | "date" | "occurrences") => {
		setEndCondition(condition);

		if (condition === "never") {
			handleFormChange("recurrence_pattern.never_ends", true);
			handleFormChange("recurrence_pattern.end_date", undefined);
			handleFormChange("recurrence_pattern.max_occurrences", undefined);
		} else if (condition === "date") {
			handleFormChange("recurrence_pattern.never_ends", false);
			handleFormChange("recurrence_pattern.max_occurrences", undefined);
		} else if (condition === "occurrences") {
			handleFormChange("recurrence_pattern.never_ends", false);
			handleFormChange("recurrence_pattern.end_date", undefined);
			if (!form.recurrence_pattern?.max_occurrences) {
				handleFormChange("recurrence_pattern.max_occurrences", 12);
			}
		}
	};

	// Handle excluded date addition
	const handleAddExcludedDate = () => {
		if (!excludedDateInput) return;

		const currentExcludedDates = form.recurrence_pattern?.excluded_dates || [];
		if (!currentExcludedDates.includes(excludedDateInput)) {
			handleFormChange("recurrence_pattern.excluded_dates", [...currentExcludedDates, excludedDateInput]);
			setExcludedDateInput("");
		}
	};

	// Handle excluded date removal
	const handleRemoveExcludedDate = (date: string) => {
		const currentExcludedDates = form.recurrence_pattern?.excluded_dates || [];
		handleFormChange(
			"recurrence_pattern.excluded_dates",
			currentExcludedDates.filter((d) => d !== date),
		);
	};

	// Generate next occurrences preview
	const generateNextOccurrencesPreview = () => {
		if (!form.recurrence_pattern?.start_date) {
			return ["Please set a start date to see occurrences"];
		}

		try {
			// Create a safe copy of the pattern with proper types
			const safePattern = {
				frequency: form.recurrence_pattern.frequency as Frequency,
				interval: form.recurrence_pattern.interval || 1,
				start_date: form.recurrence_pattern.start_date,
				end_date:
					form.recurrence_pattern.end_date && form.recurrence_pattern.end_date !== null
						? form.recurrence_pattern.end_date
						: undefined,
				max_occurrences:
					form.recurrence_pattern.max_occurrences && form.recurrence_pattern.max_occurrences !== null
						? form.recurrence_pattern.max_occurrences
						: undefined,
				never_ends: form.recurrence_pattern.never_ends || false,
				days_of_week: (form.recurrence_pattern.days_of_week || []).filter(
					(d): d is DayOfWeek => d !== null && d !== undefined,
				),
				day_of_month: (form.recurrence_pattern.day_of_month || []).filter(
					(d): d is number => d !== null && d !== undefined,
				),
				month_end: form.recurrence_pattern.month_end ?? undefined,
				month_position:
					form.recurrence_pattern?.month_position?.position && form.recurrence_pattern?.month_position?.day_of_week
						? {
								position: form.recurrence_pattern.month_position.position,
								day_of_week: form.recurrence_pattern.month_position.day_of_week as DayOfWeek,
							}
						: undefined,
				months: (form.recurrence_pattern.months || []).filter((m): m is number => m !== null && m !== undefined),
				excluded_dates: (form.recurrence_pattern.excluded_dates || []).filter(
					(d): d is string => d !== null && d !== undefined,
				),
				description: form.recurrence_pattern.description ?? undefined,
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
		if (!form.recurring) return "One-time payment";
		if (!form.recurrence_pattern?.start_date) return "Please set a start date";

		try {
			// Create a safe copy of the pattern with proper types
			const safePattern = {
				frequency: form.recurrence_pattern.frequency as Frequency,
				interval: form.recurrence_pattern.interval || 1,
				start_date: form.recurrence_pattern.start_date,
				end_date:
					form.recurrence_pattern.end_date && form.recurrence_pattern.end_date !== null
						? form.recurrence_pattern.end_date
						: undefined,
				max_occurrences:
					form.recurrence_pattern.max_occurrences && form.recurrence_pattern.max_occurrences !== null
						? form.recurrence_pattern.max_occurrences
						: undefined,
				never_ends: form.recurrence_pattern.never_ends || false,
				days_of_week: (form.recurrence_pattern.days_of_week || []).filter(
					(d): d is DayOfWeek => d !== null && d !== undefined,
				),
				day_of_month: (form.recurrence_pattern.day_of_month || []).filter(
					(d): d is number => d !== null && d !== undefined,
				),
				month_end: form.recurrence_pattern.month_end ?? undefined,
				month_position:
					form.recurrence_pattern?.month_position?.position && form.recurrence_pattern?.month_position?.day_of_week
						? {
								position: form.recurrence_pattern.month_position.position,
								day_of_week: form.recurrence_pattern.month_position.day_of_week as DayOfWeek,
							}
						: undefined,
				months: (form.recurrence_pattern.months || []).filter((m): m is number => m !== null && m !== undefined),
				excluded_dates: (form.recurrence_pattern.excluded_dates || []).filter(
					(d): d is string => d !== null && d !== undefined,
				),
				description: form.recurrence_pattern.description ?? undefined,
			};

			return generateRecurrenceDescription(safePattern);
		} catch (error) {
			console.error("Error generating description:", error);
			return "Invalid recurrence pattern";
		}
	};

	// Initialize recurrence pattern if needed
	const initializeRecurrencePattern = () => {
		if (!form.recurrence_pattern) {
			const today = new Date().toISOString().split("T")[0];

			handleFormChange("recurrence_pattern", {
				frequency: "MONTHLY" as const,
				interval: 1,
				start_date: today,
				never_ends: true,
				days_of_week: [] as DayOfWeek[],
				day_of_month: [1] as number[],
				months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as number[],
			});
		}
	};

	// Toggle recurring payment
	const handleRecurringToggle = (value: boolean) => {
		handleFormChange("recurring", value);
		if (value && !form.recurrence_pattern) {
			initializeRecurrencePattern();
		}
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
							name="recurring"
							type="radio"
							value="false"
							checked={form.recurring === false}
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
							name="recurring"
							type="radio"
							value="true"
							checked={form.recurring === true}
							onChange={() => handleRecurringToggle(true)}
							disabled={disabled}
						/>
						<label className="govuk-label govuk-radios__label" htmlFor="recurring-yes">
							Recurring payment
						</label>
					</div>
				</div>
			</fieldset>

			{form.recurring && (
				<>
					<h3 className="govuk-heading-s">Recurrence Pattern</h3>

					<div className="govuk-form-group">
						<label className="govuk-label" htmlFor="frequency">
							Frequency
						</label>
						<select
							className="govuk-select"
							id="frequency"
							name="frequency"
							value={form.recurrence_pattern?.frequency || "MONTHLY"}
							onChange={(e) => handleFormChange("recurrence_pattern.frequency", e.target.value)}
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
							value={form.recurrence_pattern?.interval || 1}
							onChange={(e) => handleFormChange("recurrence_pattern.interval", Number.parseInt(e.target.value, 10))}
							disabled={disabled}
						/>
						<span className="govuk-hint">
							{form.recurrence_pattern?.interval === 1
								? `Every ${(form.recurrence_pattern?.frequency || "MONTHLY").toLowerCase().slice(0, -2)}y`
								: `Every ${form.recurrence_pattern?.interval} ${(form.recurrence_pattern?.frequency || "MONTHLY").toLowerCase()}s`}
						</span>
					</div>

					<div className="govuk-form-group">
						<label className="govuk-label" htmlFor="start_date">
							Start date
						</label>
						<input
							className="govuk-input govuk-input--width-10"
							id="start_date"
							name="start_date"
							type="date"
							value={form.recurrence_pattern?.start_date || ""}
							onChange={(e) => handleFormChange("recurrence_pattern.start_date", e.target.value)}
							disabled={disabled}
						/>
					</div>

					{form.recurrence_pattern?.frequency === "WEEKLY" && (
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
												checked={(form.recurrence_pattern?.days_of_week || []).includes(day.value)}
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

					{form.recurrence_pattern?.frequency === "MONTHLY" && (
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
											checked={!useMonthPosition && !(form.recurrence_pattern?.month_end || false)}
											onChange={() => handleMonthlyTypeChange("day")}
											disabled={disabled}
										/>
										<label className="govuk-label govuk-radios__label" htmlFor="monthly-day">
											Day(s) of month
										</label>
									</div>

									{!useMonthPosition && !(form.recurrence_pattern?.month_end || false) && (
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
																	checked={(form.recurrence_pattern?.day_of_month || []).includes(day)}
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
														value={form.recurrence_pattern?.month_position?.position || "FIRST"}
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
														value={form.recurrence_pattern?.month_position?.day_of_week || "MONDAY"}
														onChange={(e) => handleMonthPositionChange("day_of_week", e.target.value)}
														disabled={disabled}
													>
														{daysOfWeek.map((day) => (
															<option key={day.value} value={day.value}>
																{day.label}
															</option>
														))}
													</select>
												</div>
												<span className="govuk-hint">Example: "First Monday" of each month</span>
											</div>
										</div>
									)}

									<div className="govuk-radios__item">
										<input
											className="govuk-radios__input"
											id="monthly-end"
											name="monthlyType"
											type="radio"
											checked={form.recurrence_pattern?.month_end || false}
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

					{(form.recurrence_pattern?.frequency === "MONTHLY" || form.recurrence_pattern?.frequency === "YEARLY") && (
						<div className="govuk-form-group">
							<fieldset className="govuk-fieldset">
								<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
									{form.recurrence_pattern?.frequency === "MONTHLY" ? "Specific months" : "Months"}
								</legend>
								<div className="govuk-checkboxes govuk-checkboxes--small">
									{months.map((month) => (
										<div className="govuk-checkboxes__item" key={month.value}>
											<input
												className="govuk-checkboxes__input"
												id={`month-${month.value}`}
												type="checkbox"
												checked={(form.recurrence_pattern?.months || []).includes(month.value)}
												onChange={() => handleMonthChange(month.value)}
												disabled={disabled}
											/>
											<label className="govuk-label govuk-checkboxes__label" htmlFor={`month-${month.value}`}>
												{month.label}
											</label>
										</div>
									))}
								</div>
								{form.recurrence_pattern?.frequency === "YEARLY" && (
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
											<label className="govuk-label" htmlFor="end_date">
												End date
											</label>
											<input
												className="govuk-input govuk-input--width-10"
												id="end_date"
												name="end_date"
												type="date"
												value={form.recurrence_pattern?.end_date || ""}
												onChange={(e) => handleFormChange("recurrence_pattern.end_date", e.target.value)}
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
										End after occurrences
									</label>
								</div>

								{endCondition === "occurrences" && (
									<div className="govuk-radios__conditional">
										<div className="govuk-form-group">
											<label className="govuk-label" htmlFor="max_occurrences">
												Number of occurrences
											</label>
											<input
												className="govuk-input govuk-input--width-4"
												id="max_occurrences"
												name="max_occurrences"
												type="number"
												min="1"
												value={form.recurrence_pattern?.max_occurrences || 12}
												onChange={(e) =>
													handleFormChange("recurrence_pattern.max_occurrences", Number.parseInt(e.target.value, 10))
												}
												disabled={disabled}
											/>
										</div>
									</div>
								)}
							</div>
						</fieldset>
					</div>

					<div className="govuk-form-group">
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

							{(form.recurrence_pattern?.excluded_dates || []).length > 0 && (
								<div className="govuk-inset-text">
									<h4 className="govuk-heading-s">Excluded dates:</h4>
									<ul className="govuk-list">
										{(form.recurrence_pattern?.excluded_dates || [])
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
							value={form.recurrence_pattern?.description || ""}
							onChange={(e) => handleFormChange("recurrence_pattern.description", e.target.value)}
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
