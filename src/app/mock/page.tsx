"use client";

import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { calculateNextOccurrences, generateRecurrenceDescription } from "../types/recurrence";
import type { RecurringPayment, RecurrencePattern, DayOfWeek, Position, MonthPosition } from "../types/recurrence";

// Mock recurring payment page
export default function MockRecurringPaymentsPage() {
	// Define days of week and positions for dropdowns
	const daysOfWeek = [
		{ label: "Monday", value: "monday" },
		{ label: "Tuesday", value: "tuesday" },
		{ label: "Wednesday", value: "wednesday" },
		{ label: "Thursday", value: "thursday" },
		{ label: "Friday", value: "friday" },
		{ label: "Saturday", value: "saturday" },
		{ label: "Sunday", value: "sunday" },
	];

	const positions = [
		{ label: "First", value: "first" },
		{ label: "Second", value: "second" },
		{ label: "Third", value: "third" },
		{ label: "Fourth", value: "fourth" },
		{ label: "Last", value: "last" },
	];

	const months = [
		{ label: "January", value: 1 },
		{ label: "February", value: 2 },
		{ label: "March", value: 3 },
		{ label: "April", value: 4 },
		{ label: "May", value: 5 },
		{ label: "June", value: 6 },
		{ label: "July", value: 7 },
		{ label: "August", value: 8 },
		{ label: "September", value: 9 },
		{ label: "October", value: 10 },
		{ label: "November", value: 11 },
		{ label: "December", value: 12 },
	];

	// Common days of month for selection
	const commonDaysOfMonth = [1, 5, 10, 15, 20, 25, 30];

	// Initial form state
	const [formState, setFormState] = useState<RecurringPayment>({
		recurring: false,
		pattern: {
			frequency: "monthly",
			interval: 1,
			start_date: "",
			end_date: "",
			max_occurrences: 12,
			never_ends: true,
			days_of_week: [],
			day_of_month: [1], // Changed from number to array
			month_end: false,
			month_position: {
				position: "first",
				day_of_week: "monday",
			},
			months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Default all months selected
			excluded_dates: [],
		},
		created_at: new Date().toISOString(),
		created_by: "User",
	});

	// Additional UI state
	const [excludedDateInput, setExcludedDateInput] = useState("");
	const [endCondition, setEndCondition] = useState<"never" | "date" | "occurrences">("never");
	const [useMonthPosition, setUseMonthPosition] = useState(false);

	// Handle form submission
	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		console.log("Form submitted:", formState);
		alert("Payment set up successfully!");
	};

	// Handle form field changes
	const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
		const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

		// Handle nested properties (e.g., pattern.frequency)
		if (name.includes(".")) {
			const [parent, child] = name.split(".");
			setFormState({
				...formState,
				[parent as keyof RecurringPayment]: {
					...(formState[parent as keyof RecurringPayment] as object),
					[child]: type === "checkbox" ? checked : value,
				},
			});
			return;
		}

		// Handle end condition radio buttons
		if (name === "endCondition") {
			setEndCondition(value as "never" | "date" | "occurrences");

			// Update the pattern based on the selected end condition
			const updatedPattern = { ...formState.pattern };
			updatedPattern.never_ends = value === "never";
			if (value === "date") {
				updatedPattern.max_occurrences = undefined;
			} else if (value === "occurrences") {
				updatedPattern.end_date = undefined;
			} else {
				updatedPattern.end_date = undefined;
				updatedPattern.max_occurrences = undefined;
			}

			setFormState({
				...formState,
				pattern: updatedPattern,
			});
			return;
		}

		// Handle regular form fields
		setFormState({
			...formState,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	// Handle month position changes
	const handleMonthPositionChange = (field: keyof MonthPosition, value: string) => {
		setFormState({
			...formState,
			pattern: {
				...formState.pattern,
				month_position: {
					...(formState.pattern.month_position || { position: "first", day_of_week: "monday" }),
					[field]: value,
				},
			},
		});
	};

	// Handle days of week selection
	const handleDayOfWeekChange = (day: DayOfWeek) => {
		const currentDays = [...(formState.pattern.days_of_week || [])];
		const index = currentDays.indexOf(day);

		if (index === -1) {
			currentDays.push(day);
		} else {
			currentDays.splice(index, 1);
		}

		setFormState({
			...formState,
			pattern: {
				...formState.pattern,
				days_of_week: currentDays,
			},
		});
	};

	// Handle day of month selection
	const handleDayOfMonthChange = (day: number) => {
		const currentDays = [...(formState.pattern.day_of_month || [])];
		const index = currentDays.indexOf(day);

		if (index === -1) {
			currentDays.push(day);
		} else {
			currentDays.splice(index, 1);
		}

		// Sort the days for better display
		currentDays.sort((a, b) => a - b);

		setFormState({
			...formState,
			pattern: {
				...formState.pattern,
				day_of_month: currentDays,
			},
		});
	};

	// Handle month selection
	const handleMonthChange = (month: number) => {
		const currentMonths = [...(formState.pattern.months || [])];
		const index = currentMonths.indexOf(month);

		if (index === -1) {
			currentMonths.push(month);
		} else {
			currentMonths.splice(index, 1);
		}

		setFormState({
			...formState,
			pattern: {
				...formState.pattern,
				months: currentMonths,
			},
		});
	};

	// Add excluded date
	const addExcludedDate = (date: string) => {
		if (date && !formState.pattern.excluded_dates?.includes(date)) {
			setFormState({
				...formState,
				pattern: {
					...formState.pattern,
					excluded_dates: [...(formState.pattern.excluded_dates || []), date],
				},
			});
		}
		setExcludedDateInput("");
	};

	// Remove excluded date
	const removeExcludedDate = (date: string) => {
		setFormState({
			...formState,
			pattern: {
				...formState.pattern,
				excluded_dates: formState.pattern.excluded_dates?.filter((d: string) => d !== date) || [],
			},
		});
	};

	// Toggle monthly type selection
	const handleMonthlyTypeChange = (type: "day" | "position" | "end") => {
		const updatedPattern = { ...formState.pattern };

		if (type === "day") {
			setUseMonthPosition(false);
			updatedPattern.month_end = false;
		} else if (type === "position") {
			setUseMonthPosition(true);
			updatedPattern.month_end = false;

			// Ensure month_position is set
			if (!updatedPattern.month_position) {
				updatedPattern.month_position = {
					position: "first",
					day_of_week: "monday",
				};
			}
		} else if (type === "end") {
			setUseMonthPosition(false);
			updatedPattern.month_end = true;
		}

		setFormState({
			...formState,
			pattern: updatedPattern,
		});
	};

	// Generate next occurrences preview
	const generateNextOccurrencesPreview = () => {
		if (!formState.pattern.start_date) {
			return ["Please set a start date to see occurrences"];
		}

		const dates = calculateNextOccurrences(formState.pattern, 4);
		return dates.map((date) => date.toLocaleDateString("en-GB"));
	};

	// Get human-readable pattern description
	const getPatternDescription = () => {
		if (!formState.recurring) return "One-time payment";
		if (!formState.pattern.start_date) return "Please set a start date";

		return generateRecurrenceDescription(formState.pattern);
	};

	return (
		<div className="govuk-template__body">
			<header className="govuk-header" data-module="govuk-header">
				<div className="govuk-header__container govuk-width-container">
					<div className="govuk-header__logo">
						<Link href="/" className="govuk-header__link govuk-header__link--homepage">
							<span className="govuk-header__logotype">
								<span className="govuk-header__logotype-text">GOV.UK</span>
							</span>
						</Link>
					</div>
					<div className="govuk-header__content">
						<Link href="/" className="govuk-header__link govuk-header__service-name">
							Recurring Payments
						</Link>
					</div>
				</div>
			</header>

			<main className="govuk-main-wrapper" id="main-content">
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-two-thirds">
						<h1 className="govuk-heading-xl">Set up recurring payment</h1>

						<form onSubmit={handleSubmit}>
							<div className="govuk-form-group">
								<fieldset className="govuk-fieldset">
									<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
										Is this a recurring payment?
									</legend>
									<div className="govuk-radios">
										<div className="govuk-radios__item">
											<input
												className="govuk-radios__input"
												id="recurring-yes"
												name="recurring"
												type="radio"
												value="true"
												checked={formState.recurring === true}
												onChange={() => setFormState({ ...formState, recurring: true })}
											/>
											<label className="govuk-label govuk-radios__label" htmlFor="recurring-yes">
												Yes
											</label>
										</div>
										<div className="govuk-radios__item">
											<input
												className="govuk-radios__input"
												id="recurring-no"
												name="recurring"
												type="radio"
												value="false"
												checked={formState.recurring === false}
												onChange={() => setFormState({ ...formState, recurring: false })}
											/>
											<label className="govuk-label govuk-radios__label" htmlFor="recurring-no">
												No
											</label>
										</div>
									</div>
								</fieldset>
							</div>

							{formState.recurring && (
								<>
									<h2 className="govuk-heading-m">Recurrence Pattern</h2>

									<div className="govuk-form-group">
										<label className="govuk-label" htmlFor="pattern.frequency">
											Frequency
										</label>
										<select
											className="govuk-select"
											id="pattern.frequency"
											name="pattern.frequency"
											value={formState.pattern.frequency}
											onChange={handleChange}
										>
											<option value="daily">Daily</option>
											<option value="weekly">Weekly</option>
											<option value="monthly">Monthly</option>
											<option value="yearly">Yearly</option>
										</select>
									</div>

									<div className="govuk-form-group">
										<label className="govuk-label" htmlFor="pattern.interval">
											Interval
										</label>
										<input
											className="govuk-input govuk-input--width-2"
											id="pattern.interval"
											name="pattern.interval"
											type="number"
											min="1"
											value={formState.pattern.interval}
											onChange={handleChange}
										/>
										<span className="govuk-hint">
											{formState.pattern.interval === 1
												? `Every ${formState.pattern.frequency.slice(0, -2)}y`
												: `Every ${formState.pattern.interval} ${formState.pattern.frequency}s`}
										</span>
									</div>

									<div className="govuk-form-group">
										<label className="govuk-label" htmlFor="pattern.start_date">
											Start date
										</label>
										<input
											className="govuk-input govuk-input--width-10"
											id="pattern.start_date"
											name="pattern.start_date"
											type="date"
											value={formState.pattern.start_date}
											onChange={handleChange}
										/>
									</div>

									{formState.pattern.frequency === "weekly" && (
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
																checked={formState.pattern.days_of_week?.includes(day.value as DayOfWeek) || false}
																onChange={() => handleDayOfWeekChange(day.value as DayOfWeek)}
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

									{formState.pattern.frequency === "monthly" && (
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
															checked={!useMonthPosition && !formState.pattern.month_end}
															onChange={() => handleMonthlyTypeChange("day")}
														/>
														<label className="govuk-label govuk-radios__label" htmlFor="monthly-day">
															Day(s) of month
														</label>
													</div>

													<div className="govuk-radios__conditional">
														{/* Grid of 31 days */}
														<div className="govuk-grid-row">
															<div className="govuk-grid-column-full">
																<div
																	className="govuk-checkboxes govuk-checkboxes--small"
																	style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}
																>
																	{Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
																		<div
																			className="govuk-checkboxes__item"
																			key={`day-${day}`}
																			style={{ marginBottom: "10px" }}
																		>
																			<input
																				className="govuk-checkboxes__input"
																				id={`day-${day}`}
																				type="checkbox"
																				checked={formState.pattern.day_of_month?.includes(day) || false}
																				onChange={() => handleDayOfMonthChange(day)}
																				disabled={useMonthPosition || formState.pattern.month_end}
																			/>
																			<label
																				className="govuk-label govuk-checkboxes__label"
																				htmlFor={`day-${day}`}
																				style={{ textAlign: "center" }}
																			>
																				{day}
																			</label>
																		</div>
																	))}
																</div>
															</div>
														</div>

														{/* Selected days display */}
														{formState.pattern.day_of_month && formState.pattern.day_of_month.length > 0 && (
															<div className="govuk-inset-text">
																<h4 className="govuk-heading-s">Selected days:</h4>
																<p>{formState.pattern.day_of_month.map(String).join(", ")}</p>
															</div>
														)}
													</div>

													<div className="govuk-radios__item">
														<input
															className="govuk-radios__input"
															id="monthly-position"
															name="monthlyType"
															type="radio"
															checked={useMonthPosition}
															onChange={() => handleMonthlyTypeChange("position")}
														/>
														<label className="govuk-label govuk-radios__label" htmlFor="monthly-position">
															Specific day
														</label>
													</div>

													<div className="govuk-radios__conditional">
														<div className="govuk-form-group">
															<div className="govuk-grid-row">
																<div className="govuk-grid-column-one-half">
																	<label className="govuk-label" htmlFor="position">
																		Position
																	</label>
																	<select
																		className="govuk-select"
																		id="position"
																		name="position"
																		value={formState.pattern.month_position?.position || "first"}
																		onChange={(e) => handleMonthPositionChange("position", e.target.value as Position)}
																		disabled={!useMonthPosition}
																	>
																		{positions.map((pos) => (
																			<option key={pos.value} value={pos.value}>
																				{pos.label}
																			</option>
																		))}
																	</select>
																</div>
																<div className="govuk-grid-column-one-half">
																	<label className="govuk-label" htmlFor="dayOfWeek">
																		Day
																	</label>
																	<select
																		className="govuk-select"
																		id="dayOfWeek"
																		name="dayOfWeek"
																		value={formState.pattern.month_position?.day_of_week || "monday"}
																		onChange={(e) =>
																			handleMonthPositionChange("day_of_week", e.target.value as DayOfWeek)
																		}
																		disabled={!useMonthPosition}
																	>
																		{daysOfWeek.map((day) => (
																			<option key={day.value} value={day.value}>
																				{day.label}
																			</option>
																		))}
																	</select>
																</div>
															</div>
														</div>
													</div>

													<div className="govuk-radios__item">
														<input
															className="govuk-radios__input"
															id="monthly-end"
															name="monthlyType"
															type="radio"
															checked={formState.pattern.month_end || false}
															onChange={() => handleMonthlyTypeChange("end")}
														/>
														<label className="govuk-label govuk-radios__label" htmlFor="monthly-end">
															Last day of month
														</label>
													</div>
												</div>
											</fieldset>
										</div>
									)}

									{(formState.pattern.frequency === "monthly" || formState.pattern.frequency === "yearly") && (
										<div className="govuk-form-group">
											<fieldset className="govuk-fieldset">
												<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
													{formState.pattern.frequency === "monthly" ? "Specific months" : "Months"}
												</legend>
												<div className="govuk-checkboxes govuk-checkboxes--small">
													{months.map((month) => (
														<div className="govuk-checkboxes__item" key={month.value}>
															<input
																className="govuk-checkboxes__input"
																id={`month-${month.value}`}
																type="checkbox"
																checked={formState.pattern.months?.includes(month.value) || false}
																onChange={() => handleMonthChange(month.value)}
															/>
															<label className="govuk-label govuk-checkboxes__label" htmlFor={`month-${month.value}`}>
																{month.label}
															</label>
														</div>
													))}
												</div>
												{formState.pattern.frequency === "yearly" && (
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
														onChange={handleChange}
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
														onChange={handleChange}
													/>
													<label className="govuk-label govuk-radios__label" htmlFor="end-date">
														End by date
													</label>
												</div>

												{endCondition === "date" && (
													<div className="govuk-radios__conditional">
														<div className="govuk-form-group">
															<label className="govuk-label" htmlFor="pattern.end_date">
																End date
															</label>
															<input
																className="govuk-input govuk-input--width-10"
																id="pattern.end_date"
																name="pattern.end_date"
																type="date"
																value={formState.pattern.end_date || ""}
																onChange={handleChange}
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
														onChange={handleChange}
													/>
													<label className="govuk-label govuk-radios__label" htmlFor="end-occurrences">
														End after occurrences
													</label>
												</div>

												{endCondition === "occurrences" && (
													<div className="govuk-radios__conditional">
														<div className="govuk-form-group">
															<label className="govuk-label" htmlFor="pattern.max_occurrences">
																Number of occurrences
															</label>
															<input
																className="govuk-input govuk-input--width-4"
																id="pattern.max_occurrences"
																name="pattern.max_occurrences"
																type="number"
																min="1"
																value={formState.pattern.max_occurrences || 12}
																onChange={handleChange}
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
											<div className="govuk-grid-row">
												<div className="govuk-grid-column-two-thirds">
													<input
														className="govuk-input"
														id="excluded-date"
														type="date"
														value={excludedDateInput}
														onChange={(e) => setExcludedDateInput(e.target.value)}
													/>
												</div>
												<div className="govuk-grid-column-one-third">
													<button
														type="button"
														className="govuk-button govuk-button--secondary"
														onClick={() => addExcludedDate(excludedDateInput)}
													>
														Add
													</button>
												</div>
											</div>
										</fieldset>

										{formState.pattern.excluded_dates && formState.pattern.excluded_dates.length > 0 && (
											<div className="govuk-form-group">
												<h4 className="govuk-heading-s">Excluded dates:</h4>
												<ul className="govuk-list">
													{formState.pattern.excluded_dates.map((date, i) => (
														<li key={`excluded-${i}-${date}`} className="govuk-!-margin-bottom-2">
															{new Date(date).toLocaleDateString("en-GB")}
															<button
																type="button"
																className="govuk-button govuk-button--secondary govuk-!-margin-left-2 govuk-!-margin-bottom-0"
																onClick={() => removeExcludedDate(date)}
															>
																Remove
															</button>
														</li>
													))}
												</ul>
											</div>
										)}
									</div>

									<div className="govuk-form-group">
										<label className="govuk-label" htmlFor="pattern.description">
											Description (optional)
										</label>
										<input
											className="govuk-input"
											id="pattern.description"
											name="pattern.description"
											type="text"
											value={formState.pattern.description || ""}
											onChange={handleChange}
										/>
									</div>

									<div className="govuk-inset-text">
										<h3 className="govuk-heading-s">Pattern summary</h3>
										<p>{getPatternDescription()}</p>

										<h4 className="govuk-heading-s">Next occurrences:</h4>
										<ul className="govuk-list govuk-list--bullet">
											{generateNextOccurrencesPreview().map((date, i) => (
												<li key={`occurrence-${i}-${date}`}>{date}</li>
											))}
										</ul>
										<p className="govuk-hint">(Showing next 4 occurrences)</p>
									</div>
								</>
							)}

							<button type="submit" className="govuk-button">
								Save payment
							</button>
						</form>
					</div>
				</div>
			</main>
		</div>
	);
}
