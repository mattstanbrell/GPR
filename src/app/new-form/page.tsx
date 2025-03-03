"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../../../amplify/data/resource";

export default function NewFormPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [form, setForm] = useState<Schema["Form"]["type"] | null>(null);
	const [userId, setUserId] = useState<string | null>(null);

	// Create a new form when the component mounts
	useEffect(() => {
		async function createNewForm() {
			try {
				// Get the current user
				const user = await getCurrentUser();
				const currentUserId = user.userId;
				setUserId(currentUserId);

				// Generate client
				const client = generateClient<Schema>();

				// Create a new form with DRAFT status
				const { data: newForm, errors } = await client.models.Form.create({
					status: "DRAFT",
					userID: currentUserId,
					// Initialize with empty values
					caseNumber: "",
					reason: "",
					amount: 0,
					dateRequired: {
						day: 0,
						month: 0,
						year: 0,
					},
					recipientDetails: {
						name: {
							firstName: "",
							lastName: "",
						},
						address: {
							lineOne: "",
							lineTwo: "",
							townOrCity: "",
							postcode: "",
						},
					},
				});

				if (errors) {
					console.error("Error creating form:", errors);
					throw new Error(`Failed to create form: ${JSON.stringify(errors)}`);
				}

				if (!newForm) {
					throw new Error("Failed to create form: No form data returned");
				}

				// Set the form state
				setForm(newForm);
				setLoading(false);
			} catch (err) {
				console.error("Error creating new form:", err);
				setError(err instanceof Error ? err.message : String(err));
				setLoading(false);
			}
		}

		createNewForm();
	}, []);

	// Handle form field changes
	const handleFormChange = (field: string, value: unknown) => {
		if (!form) return;

		setForm({
			...form,
			[field]: value,
		});
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!form || !userId) return;

		try {
			setLoading(true);

			const client = generateClient<Schema>();

			// Update the form
			const { errors } = await client.models.Form.update({
				id: form.id,
				caseNumber: form.caseNumber,
				reason: form.reason,
				amount: form.amount,
				dateRequired: form.dateRequired,
				recipientDetails: form.recipientDetails,
				status: "SUBMITTED", // Change status to SUBMITTED
			});

			if (errors) {
				throw new Error(`Failed to update form: ${JSON.stringify(errors)}`);
			}

			// Redirect to form board or show success message
			const redirectUrl = "/form-board";
			window.location.href = redirectUrl;
		} catch (err) {
			console.error("Error submitting form:", err);
			setError(err instanceof Error ? err.message : String(err));
			setLoading(false);
		}
	};

	if (error) {
		return (
			<div className="govuk-width-container">
				<main className="govuk-main-wrapper">
					<div
						className="govuk-error-summary"
						aria-labelledby="error-summary-title"
						role="alert"
						tabIndex={-1}
					>
						<h2 className="govuk-error-summary__title" id="error-summary-title">
							There was a problem with your form
						</h2>
						<div className="govuk-error-summary__body">
							<p>{error}</p>
							<button
								className="govuk-button"
								data-module="govuk-button"
								onClick={() => {
									const homeUrl = "/home";
									window.location.href = homeUrl;
								}}
								type="button"
							>
								Return to Home
							</button>
						</div>
					</div>
				</main>
			</div>
		);
	}

	if (loading || !form) {
		return (
			<div className="govuk-width-container">
				<main className="govuk-main-wrapper">
					<div className="govuk-panel govuk-panel--confirmation">
						<h1 className="govuk-panel__title">Setting up your form</h1>
						<div className="govuk-panel__body">Please wait...</div>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="govuk-width-container">
			<main className="govuk-main-wrapper">
				<h1 className="govuk-heading-l">New Form</h1>

				<form onSubmit={handleSubmit}>
					{/* Case Number */}
					<div className="govuk-form-group">
						<label className="govuk-label" htmlFor="case-number">
							Case Number
						</label>
						<input
							className="govuk-input"
							id="case-number"
							name="case-number"
							type="text"
							value={form.caseNumber || ""}
							onChange={(e) => handleFormChange("caseNumber", e.target.value)}
						/>
					</div>

					{/* Reason */}
					<div className="govuk-form-group">
						<label className="govuk-label" htmlFor="reason">
							Reason for Request
						</label>
						<textarea
							className="govuk-textarea"
							id="reason"
							name="reason"
							rows={5}
							value={form.reason || ""}
							onChange={(e) => handleFormChange("reason", e.target.value)}
						/>
					</div>

					{/* Amount */}
					<div className="govuk-form-group">
						<label className="govuk-label" htmlFor="amount">
							Amount (£)
						</label>
						<input
							className="govuk-input govuk-input--width-10"
							id="amount"
							name="amount"
							type="number"
							step="0.01"
							value={form.amount || 0}
							onChange={(e) =>
								handleFormChange("amount", Number.parseFloat(e.target.value))
							}
						/>
					</div>

					{/* Date Required */}
					<div className="govuk-form-group">
						<fieldset
							className="govuk-fieldset"
							aria-describedby="date-required-hint"
						>
							<legend className="govuk-fieldset__legend">Date Required</legend>
							<div id="date-required-hint" className="govuk-hint">
								For example, 27 3 2023
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
											type="number"
											min="1"
											max="31"
											value={form.dateRequired?.day || ""}
											onChange={(e) => {
												const day = Number.parseInt(e.target.value, 10);
												handleFormChange("dateRequired", {
													...form.dateRequired,
													day,
												});
											}}
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
											type="number"
											min="1"
											max="12"
											value={form.dateRequired?.month || ""}
											onChange={(e) => {
												const month = Number.parseInt(e.target.value, 10);
												handleFormChange("dateRequired", {
													...form.dateRequired,
													month,
												});
											}}
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
											type="number"
											min="2023"
											max="2030"
											value={form.dateRequired?.year || ""}
											onChange={(e) => {
												const year = Number.parseInt(e.target.value, 10);
												handleFormChange("dateRequired", {
													...form.dateRequired,
													year,
												});
											}}
										/>
									</div>
								</div>
							</div>
						</fieldset>
					</div>

					{/* Recipient Details */}
					<div className="govuk-form-group">
						<fieldset className="govuk-fieldset">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
								<h2 className="govuk-fieldset__heading">Recipient Details</h2>
							</legend>

							{/* Name */}
							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="recipient-first-name">
									First Name
								</label>
								<input
									className="govuk-input"
									id="recipient-first-name"
									name="recipient-first-name"
									type="text"
									value={form.recipientDetails?.name?.firstName || ""}
									onChange={(e) =>
										handleFormChange("recipientDetails", {
											...form.recipientDetails,
											name: {
												...form.recipientDetails?.name,
												firstName: e.target.value,
											},
										})
									}
								/>
							</div>

							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="recipient-last-name">
									Last Name
								</label>
								<input
									className="govuk-input"
									id="recipient-last-name"
									name="recipient-last-name"
									type="text"
									value={form.recipientDetails?.name?.lastName || ""}
									onChange={(e) =>
										handleFormChange("recipientDetails", {
											...form.recipientDetails,
											name: {
												...form.recipientDetails?.name,
												lastName: e.target.value,
											},
										})
									}
								/>
							</div>

							{/* Address */}
							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="address-line-1">
									Address Line 1
								</label>
								<input
									className="govuk-input"
									id="address-line-1"
									name="address-line-1"
									type="text"
									value={form.recipientDetails?.address?.lineOne || ""}
									onChange={(e) =>
										handleFormChange("recipientDetails", {
											...form.recipientDetails,
											address: {
												...form.recipientDetails?.address,
												lineOne: e.target.value,
											},
										})
									}
								/>
							</div>

							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="address-line-2">
									Address Line 2 (optional)
								</label>
								<input
									className="govuk-input"
									id="address-line-2"
									name="address-line-2"
									type="text"
									value={form.recipientDetails?.address?.lineTwo || ""}
									onChange={(e) =>
										handleFormChange("recipientDetails", {
											...form.recipientDetails,
											address: {
												...form.recipientDetails?.address,
												lineTwo: e.target.value,
											},
										})
									}
								/>
							</div>

							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="town-city">
									Town or City
								</label>
								<input
									className="govuk-input govuk-input--width-20"
									id="town-city"
									name="town-city"
									type="text"
									value={form.recipientDetails?.address?.townOrCity || ""}
									onChange={(e) =>
										handleFormChange("recipientDetails", {
											...form.recipientDetails,
											address: {
												...form.recipientDetails?.address,
												townOrCity: e.target.value,
											},
										})
									}
								/>
							</div>

							<div className="govuk-form-group">
								<label className="govuk-label" htmlFor="postcode">
									Postcode
								</label>
								<input
									className="govuk-input govuk-input--width-10"
									id="postcode"
									name="postcode"
									type="text"
									value={form.recipientDetails?.address?.postcode || ""}
									onChange={(e) =>
										handleFormChange("recipientDetails", {
											...form.recipientDetails,
											address: {
												...form.recipientDetails?.address,
												postcode: e.target.value,
											},
										})
									}
								/>
							</div>
						</fieldset>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						className="govuk-button"
						data-module="govuk-button"
					>
						Submit Form
					</button>
				</form>
			</main>
		</div>
	);
}
