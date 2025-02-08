"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();

type Message = {
	id: number;
	role: "user" | "assistant" | "tool";
	content: string;
	tool_call_id?: string;
	tool_calls?: Array<{
		id: string;
		type: "function";
		function: { name: string; arguments: string };
	}>;
};

type StateMessage = {
	type: "human" | "ai" | "tool";
	content: string;
	tool_call_id?: string;
	tool_calls?: Array<{
		id: string;
		type: "function";
		function: { name: string; arguments: string };
	}>;
};

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

	const [animatingFields, setAnimatingFields] = useState<Set<string>>(
		new Set(),
	);

	const animateField = (fieldName: string) => {
		setAnimatingFields((prev) => new Set(prev).add(fieldName));
		setTimeout(() => {
			setAnimatingFields((prev) => {
				const newSet = new Set(prev);
				newSet.delete(fieldName);
				return newSet;
			});
		}, 3000); // Duration of animation
	};

	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const handleMessageSubmit = async () => {
		if (!message.trim()) return;

		const userMessage: Message = {
			id: Date.now(),
			role: "user",
			content: message,
		};

		// Find any manually updated fields by comparing with previous state
		const findUpdates = (
			current: typeof formData,
			previous: Partial<typeof formData>,
			path = "",
		): string[] => {
			const updates: string[] = [];
			for (const [key, value] of Object.entries(current)) {
				const fullPath = path ? `${path}.${key}` : key;
				if (typeof value === "object" && value !== null) {
					updates.push(
						...findUpdates(
							value,
							(previous?.[key as keyof typeof previous] || {}) as any,
							fullPath,
						),
					);
				} else if (
					value !== "" &&
					value !== (previous as any)?.[key] &&
					value !== previous?.[key as keyof typeof previous]
				) {
					updates.push(`${fullPath} to ${value}`);
				}
			}
			return updates;
		};

		// Get the previous state from the last response
		const previousState = messages
			.filter((msg) => msg.role === "assistant")
			.reduce(
				(state, msg) => {
					try {
						const parsedResponse = JSON.parse(msg.content);
						if (parsedResponse.formData) {
							return parsedResponse.formData;
						}
					} catch (e) {
						// Not a JSON message, ignore
					}
					return state;
				},
				{} as Partial<typeof formData>,
			);

		// Find which fields were manually updated
		const updates = findUpdates(formData, previousState);

		// Create messages array with update note if needed
		const messagesToSend = [...messages];
		if (updates.length > 0) {
			messagesToSend.push({
				id: Date.now() - 1,
				role: "user",
				content: `[Note: The following fields were manually updated: ${updates.join(", ")}. These updates have already been applied, no need to use the updateFormField tool.]`,
			});
		}
		messagesToSend.push(userMessage);

		setMessages((prev) => [...prev, userMessage]);
		setLoading(true);
		setMessage(""); // Clear the input immediately for better UX

		try {
			console.log(
				"Sending messages to norm:",
				messagesToSend.map((msg) => ({
					role: msg.role,
					content: msg.content,
					tool_call_id: msg.tool_call_id,
				})),
			);

			const response = await client.queries.norm({
				messages: messagesToSend.map((msg) =>
					JSON.stringify({
						role: msg.role,
						content: msg.content,
						...(msg.tool_call_id && { tool_call_id: msg.tool_call_id }),
					}),
				),
				initialState: JSON.stringify(formData),
			});

			console.log("Raw response from norm:", response);

			if (!response) {
				throw new Error("No response received from norm");
			}

			// Parse the response which now includes state information
			try {
				const parsedResponse = JSON.parse(response.data || "{}");
				console.log("Parsed response:", parsedResponse);

				// Update form data if we received it
				if (parsedResponse.formData) {
					// Find which fields changed
					const findChangedFields = (
						oldData: typeof formData,
						newData: Partial<typeof formData>,
						prefix = "",
					): string[] => {
						const changedFields: string[] = [];
						for (const [key, value] of Object.entries(newData)) {
							const fullPath = prefix ? `${prefix}.${key}` : key;
							if (typeof value === "object" && value !== null) {
								changedFields.push(
									...findChangedFields(
										oldData[key as keyof typeof oldData] as any,
										value as any,
										fullPath,
									),
								);
							} else if (value !== oldData[key as keyof typeof oldData]) {
								changedFields.push(fullPath);
							}
						}
						return changedFields;
					};

					// Find which fields changed
					const changedFields = findChangedFields(
						formData,
						parsedResponse.formData,
					);

					// Update form data
					setFormData((prev) => ({
						...prev,
						...parsedResponse.formData,
					}));

					// Animate all changed fields
					for (const field of changedFields) {
						animateField(field);
					}
				}

				// Add the assistant's response to messages
				const assistantMessage: Message = {
					id: Date.now(),
					role: "assistant",
					content: parsedResponse.message || "No response received",
				};
				setMessages((prev) => [...prev, assistantMessage]);
			} catch (error) {
				console.error("Error parsing response:", error);
				throw error;
			}
		} catch (error) {
			console.error("Error calling norm:", error);
			const errorMessage: Message = {
				id: Date.now(),
				role: "assistant",
				content: "Sorry, I encountered an error. Please try again.",
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setLoading(false);
		}
	};

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
			<style jsx>{`
				@keyframes highlight {
					0% {
						background-color: transparent;
					}
					50% {
						background-color: #ffdd00;
					}
					100% {
						background-color: transparent;
					}
				}

				.field-animation {
					animation: highlight 1s ease-in-out;
				}
			`}</style>

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
											Case number
										</label>
										<input
											className={`govuk-input ${
												animatingFields.has("caseNumber")
													? "field-animation"
													: ""
											}`}
											id="caseNumber"
											name="caseNumber"
											type="text"
											value={formData.caseNumber}
											onChange={handleChange("caseNumber")}
										/>
									</div>

									<div className="govuk-form-group">
										<label className="govuk-label" htmlFor="reason">
											Reason for expense
										</label>
										<textarea
											className={`govuk-textarea ${
												animatingFields.has("reason") ? "field-animation" : ""
											}`}
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
												className={`govuk-input govuk-input--width-5 ${
													animatingFields.has("amount") ? "field-animation" : ""
												}`}
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
															className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
																animatingFields.has("dateRequired.day")
																	? "field-animation"
																	: ""
															}`}
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
															className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
																animatingFields.has("dateRequired.month")
																	? "field-animation"
																	: ""
															}`}
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
															className={`govuk-input govuk-date-input__input govuk-input--width-4 ${
																animatingFields.has("dateRequired.year")
																	? "field-animation"
																	: ""
															}`}
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
											className={`govuk-input ${
												animatingFields.has("firstName")
													? "field-animation"
													: ""
											}`}
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
											className={`govuk-input ${
												animatingFields.has("lastName") ? "field-animation" : ""
											}`}
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
											className={`govuk-input ${
												animatingFields.has("address.line1")
													? "field-animation"
													: ""
											}`}
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
											className={`govuk-input ${
												animatingFields.has("address.line2")
													? "field-animation"
													: ""
											}`}
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
											className={`govuk-input govuk-input--width-20 ${
												animatingFields.has("address.town")
													? "field-animation"
													: ""
											}`}
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
											className={`govuk-input govuk-input--width-10 ${
												animatingFields.has("address.postcode")
													? "field-animation"
													: ""
											}`}
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
								{messages.map((msg) => (
									<div
										key={msg.id}
										className={`govuk-inset-text ${
											msg.role === "assistant" ? "govuk-inset-text--blue" : ""
										}`}
										style={{
											marginLeft: msg.role === "user" ? "auto" : "0",
											marginRight: msg.role === "assistant" ? "auto" : "0",
											maxWidth: "80%",
											marginTop: 0,
											marginBottom: 0,
											backgroundColor:
												msg.role === "user" ? "#f3f2f1" : "#f0f7ff",
											borderColor: msg.role === "user" ? "#505a5f" : "#1d70b8",
											borderLeftWidth: msg.role === "assistant" ? "5px" : "0",
											borderRightWidth: msg.role === "user" ? "5px" : "0",
											borderStyle: "solid",
											borderTop: "none",
											borderBottom: "none",
										}}
									>
										<p className="govuk-body" style={{ margin: 0 }}>
											{msg.content}
										</p>
									</div>
								))}
								{loading && (
									<div className="govuk-body" style={{ alignSelf: "center" }}>
										<span className="govuk-hint">Norm is typing...</span>
									</div>
								)}
							</div>
							<div className="govuk-form-group" style={{ marginBottom: 0 }}>
								<div style={{ display: "flex", gap: "10px" }}>
									<textarea
										className="govuk-textarea"
										rows={3}
										aria-label="Message input"
										placeholder="Type your message here..."
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.shiftKey) {
												e.preventDefault();
												handleMessageSubmit();
											}
										}}
									/>
									{/* we don't need this button rn */}
									{/* <button
										type="button"
										className="govuk-button"
										style={{
											alignSelf: "flex-end",
											whiteSpace: "nowrap",
										}}
										onClick={handleMessageSubmit}
										disabled={loading}
									>
										{loading ? "Sending..." : "Send"}
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
