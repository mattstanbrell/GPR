"use client";

import { useState } from "react";

export default function NormPage() {
	const [formData, setFormData] = useState({
		caseNumber: "",
		reason: "",
		amount: "",
		dateRequired: {
			day: "",
			month: "",
			year: "",
		},
		firstName: "",
		lastName: "",
		address: {
			line1: "",
			line2: "",
			town: "",
			postcode: "",
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Handle form submission
		console.log(formData);
	};

	const handleChange =
		(field: string) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const value = e.target.value;
			setFormData((prev) => {
				// Handle nested date fields
				if (field.startsWith("date.")) {
					const datePart = field.split(".")[1];
					return {
						...prev,
						dateRequired: {
							...prev.dateRequired,
							[datePart]: value,
						},
					};
				}
				// Handle nested address fields
				if (field.startsWith("address.")) {
					const addressPart = field.split(".")[1];
					return {
						...prev,
						address: {
							...prev.address,
							[addressPart]: value,
						},
					};
				}
				// Handle regular fields
				return {
					...prev,
					[field]: value,
				};
			});
		};

	return (
		<main className="govuk-main-wrapper">
			<div className="govuk-width-container">
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-two-thirds">
						<h1 className="govuk-heading-xl">Submit Expense Request</h1>
						<form onSubmit={handleSubmit}>
							<fieldset className="govuk-fieldset">
								<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
									<h2 className="govuk-fieldset__heading">Expense details</h2>
								</legend>

								<div className="govuk-form-group">
									<label className="govuk-label" htmlFor="caseNumber">
										Case Number
									</label>
									<input
										className="govuk-input"
										id="caseNumber"
										name="caseNumber"
										type="text"
										value={formData.caseNumber}
										onChange={handleChange("caseNumber")}
									/>
								</div>

								<div className="govuk-form-group">
									<label className="govuk-label" htmlFor="reason">
										Reason for Expense
									</label>
									<textarea
										className="govuk-textarea"
										id="reason"
										name="reason"
										rows={5}
										value={formData.reason}
										onChange={handleChange("reason")}
									/>
								</div>

								<div className="govuk-form-group">
									<label className="govuk-label" htmlFor="amount">
										Amount
									</label>
									<div className="govuk-input__wrapper">
										<div className="govuk-input__prefix" aria-hidden="true">
											£
										</div>
										<input
											className="govuk-input govuk-input--width-5"
											id="amount"
											name="amount"
											type="text"
											spellCheck="false"
											value={formData.amount}
											onChange={handleChange("amount")}
										/>
									</div>
								</div>

								<div className="govuk-form-group">
									<fieldset
										className="govuk-fieldset"
										aria-describedby="date-required-hint"
									>
										<legend className="govuk-fieldset__legend">
											Date Required
										</legend>
										<div id="date-required-hint" className="govuk-hint">
											The date you need the prepaid card to be ready by.
										</div>
										<div className="govuk-date-input" id="date-required">
											<div className="govuk-date-input__item">
												<div className="govuk-form-group">
													<label
														className="govuk-label govuk-date-input__label"
														htmlFor="date-required-day"
													>
														Day
													</label>
													<input
														className="govuk-input govuk-date-input__input govuk-input--width-2"
														id="date-required-day"
														name="date-required-day"
														type="text"
														inputMode="numeric"
														value={formData.dateRequired.day}
														onChange={handleChange("date.day")}
													/>
												</div>
											</div>
											<div className="govuk-date-input__item">
												<div className="govuk-form-group">
													<label
														className="govuk-label govuk-date-input__label"
														htmlFor="date-required-month"
													>
														Month
													</label>
													<input
														className="govuk-input govuk-date-input__input govuk-input--width-2"
														id="date-required-month"
														name="date-required-month"
														type="text"
														inputMode="numeric"
														value={formData.dateRequired.month}
														onChange={handleChange("date.month")}
													/>
												</div>
											</div>
											<div className="govuk-date-input__item">
												<div className="govuk-form-group">
													<label
														className="govuk-label govuk-date-input__label"
														htmlFor="date-required-year"
													>
														Year
													</label>
													<input
														className="govuk-input govuk-date-input__input govuk-input--width-4"
														id="date-required-year"
														name="date-required-year"
														type="text"
														inputMode="numeric"
														value={formData.dateRequired.year}
														onChange={handleChange("date.year")}
													/>
												</div>
											</div>
										</div>
									</fieldset>
								</div>
							</fieldset>

							<fieldset className="govuk-fieldset">
								<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
									<h2 className="govuk-fieldset__heading">
										Card recipient details
									</h2>
								</legend>
								<div className="govuk-hint">
									These are the details of the person who will receive the
									prepaid card.
								</div>

								<div className="govuk-form-group">
									<label className="govuk-label" htmlFor="firstName">
										First name
									</label>
									<input
										className="govuk-input"
										id="firstName"
										name="firstName"
										type="text"
										value={formData.firstName}
										onChange={handleChange("firstName")}
									/>
								</div>

								<div className="govuk-form-group">
									<label className="govuk-label" htmlFor="lastName">
										Last name
									</label>
									<input
										className="govuk-input"
										id="lastName"
										name="lastName"
										type="text"
										value={formData.lastName}
										onChange={handleChange("lastName")}
									/>
								</div>

								<div className="govuk-form-group">
									<label className="govuk-label" htmlFor="address-line-1">
										Address line 1
									</label>
									<input
										className="govuk-input"
										id="address-line-1"
										name="address-line-1"
										type="text"
										value={formData.address.line1}
										onChange={handleChange("address.line1")}
										autoComplete="address-line1"
									/>
								</div>
								<div className="govuk-form-group">
									<label className="govuk-label" htmlFor="address-line-2">
										Address line 2 (optional)
									</label>
									<input
										className="govuk-input"
										id="address-line-2"
										name="address-line-2"
										type="text"
										value={formData.address.line2}
										onChange={handleChange("address.line2")}
										autoComplete="address-line2"
									/>
								</div>
								<div className="govuk-form-group">
									<label className="govuk-label" htmlFor="address-town">
										Town or city
									</label>
									<input
										className="govuk-input govuk-!-width-two-thirds"
										id="address-town"
										name="address-town"
										type="text"
										value={formData.address.town}
										onChange={handleChange("address.town")}
										autoComplete="address-level2"
									/>
								</div>
								<div className="govuk-form-group">
									<label className="govuk-label" htmlFor="address-postcode">
										Postcode
									</label>
									<input
										className="govuk-input govuk-input--width-10"
										id="address-postcode"
										name="address-postcode"
										type="text"
										value={formData.address.postcode}
										onChange={handleChange("address.postcode")}
										autoComplete="postal-code"
									/>
								</div>
							</fieldset>

							<button
								type="submit"
								className="govuk-button"
								data-module="govuk-button"
							>
								Submit
							</button>
						</form>
					</div>
				</div>
			</div>
		</main>
	);
}
