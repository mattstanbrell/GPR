"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();

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

	const [normResult, setNormResult] = useState<string>("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const callNorm = async () => {
			setLoading(true);
			try {
				const response = await client.queries.norm({
					name: "test",
				});
				setNormResult(response.data || "No response data");
			} catch (error) {
				console.error("Error calling norm:", error);
				setNormResult("Error calling function. Check console for details.");
			} finally {
				setLoading(false);
			}
		};
		callNorm();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log(formData);
	};

	const handleChange =
		(field: string) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const value = e.target.value;
			setFormData((prev) => {
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
				return {
					...prev,
					[field]: value,
				};
			});
		};

	return (
		<div style={{ height: "calc(100vh - 140px)", overflow: "hidden" }}>
			<main
				className="govuk-main-wrapper"
				style={{ height: "100%", padding: "0" }}
			>
				<div className="govuk-width-container" style={{ height: "100%" }}>
					<div className="govuk-grid-row" style={{ height: "100%" }}>
						{/* Left side - Small Form */}
						<div
							className="govuk-grid-column-one-half"
							style={{
								borderRight: "1px solid #b1b4b6",
								paddingRight: "30px",
								height: "calc(100% - 30px)",
								overflowY: "auto",
							}}
						>
							{/* <h1 className="govuk-heading-l">Expense Request</h1> */}
							<h1 className="govuk-heading-l">Form</h1>
							<form onSubmit={handleSubmit} style={{ marginBottom: 0 }}>
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
											rows={3}
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
												Date prepaid card is needed by.
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
											className="govuk-input govuk-input--width-20"
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
									style={{ marginBottom: 0 }}
								>
									Submit
								</button>
							</form>
						</div>

						{/* Right side - Fixed */}
						<div
							className="govuk-grid-column-one-half"
							style={{
								height: "100%",
								display: "flex",
								flexDirection: "column",
							}}
						>
							<h2 className="govuk-heading-l">Norm</h2>
							<div style={{ flexGrow: 1, padding: "20px" }}>
								{loading ? (
									<div className="govuk-body">Loading...</div>
								) : (
									normResult && <div className="govuk-body">{normResult}</div>
								)}
							</div>
							<div className="govuk-form-group" style={{ marginBottom: 0 }}>
								<div style={{ display: "flex", gap: "10px" }}>
									<textarea
										className="govuk-textarea"
										rows={3}
										aria-label="Message input"
										placeholder="Type your message here..."
									/>
									{/* <button
										type="button"
										className="govuk-button"
										style={{
											alignSelf: "flex-end",
											whiteSpace: "nowrap",
										}}
									>
										Send
									</button> */}
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
