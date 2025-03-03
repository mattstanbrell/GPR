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
	const [message, setMessage] = useState("");

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

	// Placeholder for message submission
	const handleMessageSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Message submitted:", message);
		setMessage("");
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
		<main
			className="govuk-main-wrapper"
			style={{ height: "100%", padding: "0" }}
		>
			<div className="govuk-width-container" style={{ height: "100%" }}>
				<div className="govuk-grid-row" style={{ height: "100%" }}>
					{/* Left side - Form Section */}
					<div
						className="govuk-grid-column-one-half"
						style={{
							borderRight: "1px solid #b1b4b6",
							paddingRight: "30px",
							height: "calc(100% - 30px)",
							overflowY: "auto",
						}}
					>
						<h1 className="govuk-heading-l">Form</h1>
						<form onSubmit={handleSubmit} style={{ marginBottom: 0 }}>
							<fieldset className="govuk-fieldset">
								<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
									<h2 className="govuk-fieldset__heading">Expense details</h2>
								</legend>

								<div className="govuk-form-group">
									<label className="govuk-label" htmlFor="caseNumber">
										Case number
									</label>
									<input
										className="govuk-input"
										id="caseNumber"
										name="caseNumber"
										type="text"
										value={form.caseNumber || ""}
										onChange={(e) =>
											handleFormChange("caseNumber", e.target.value)
										}
									/>
								</div>

								<div className="govuk-form-group">
									<label className="govuk-label" htmlFor="reason">
										Reason for expense
									</label>
									<textarea
										className="govuk-textarea"
										id="reason"
										name="reason"
										rows={3}
										value={form.reason || ""}
										onChange={(e) => handleFormChange("reason", e.target.value)}
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
											value={form.amount?.toString() || ""}
											onChange={(e) => {
												const value = e.target.value;
												const numericValue = value
													? Number.parseFloat(value)
													: 0;
												handleFormChange("amount", numericValue);
											}}
										/>
									</div>
								</div>

								<div className="govuk-form-group">
									<fieldset
										className="govuk-fieldset"
										aria-describedby="date-required-hint"
									>
										<legend className="govuk-fieldset__legend">
											Date prepaid card is needed by
										</legend>
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
														value={form.dateRequired?.day?.toString() || ""}
														onChange={(e) => {
															const day = e.target.value
																? Number.parseInt(e.target.value, 10)
																: 0;
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
														type="text"
														inputMode="numeric"
														value={form.dateRequired?.month?.toString() || ""}
														onChange={(e) => {
															const month = e.target.value
																? Number.parseInt(e.target.value, 10)
																: 0;
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
														type="text"
														inputMode="numeric"
														value={form.dateRequired?.year?.toString() || ""}
														onChange={(e) => {
															const year = e.target.value
																? Number.parseInt(e.target.value, 10)
																: 0;
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
							</fieldset>

							<fieldset className="govuk-fieldset">
								<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
									<h2 className="govuk-fieldset__heading">
										Card recipient details
									</h2>
								</legend>
								<div className="govuk-hint">
									Details of the person receiving the prepaid card.
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
									<label className="govuk-label" htmlFor="lastName">
										Last name
									</label>
									<input
										className="govuk-input"
										id="lastName"
										name="lastName"
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

								<div className="govuk-form-group">
									<label className="govuk-label" htmlFor="address-line-1">
										Address line 1
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
										autoComplete="address-line2"
									/>
								</div>

								<div className="govuk-form-group">
									<label className="govuk-label" htmlFor="address-town">
										Town or city
									</label>
									<input
										className="govuk-input govuk-input--width-20"
										id="address-town"
										name="address-town"
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
										autoComplete="postal-code"
									/>
								</div>
							</fieldset>

							<button
								type="submit"
								className="govuk-button"
								style={{ marginBottom: 0 }}
							>
								Submit
							</button>
						</form>
					</div>

					{/* Right side - Norm Chat Interface */}
					<div
						className="govuk-grid-column-one-half"
						style={{
							height: "100%",
							display: "flex",
							flexDirection: "column",
							paddingLeft: "30px",
						}}
					>
						<h2 className="govuk-heading-l">Norm</h2>
						<div
							style={{
								flexGrow: 1,
								overflowY: "auto",
								display: "flex",
								flexDirection: "column",
								gap: "15px",
								paddingTop: "20px",
								paddingBottom: "20px",
							}}
						>
							{/* Placeholder for chat messages */}
							<div
								className="govuk-inset-text govuk-inset-text--blue"
								style={{
									marginLeft: "0",
									marginRight: "auto",
									maxWidth: "80%",
									marginTop: 0,
									marginBottom: 0,
									backgroundColor: "#f0f7ff",
									borderColor: "#1d70b8",
									borderLeftWidth: "5px",
									borderRightWidth: "0",
									borderStyle: "solid",
									borderTop: "none",
									borderBottom: "none",
								}}
							>
								<p className="govuk-body" style={{ margin: 0 }}>
									Hello! I'm Norm, your assistant. I can help you fill out this
									form. What would you like to know?
								</p>
							</div>
						</div>
						<div className="govuk-form-group" style={{ marginBottom: 0 }}>
							<div style={{ display: "flex", gap: "10px", width: "100%" }}>
								<form
									onSubmit={handleMessageSubmit}
									style={{ width: "100%", display: "flex", gap: "10px" }}
								>
									<input
										className="govuk-input"
										type="text"
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										placeholder="Type your message here..."
										style={{ flexGrow: 1 }}
									/>
									<button
										type="submit"
										className="govuk-button govuk-button--secondary"
										style={{ marginBottom: 0 }}
									>
										Send
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
