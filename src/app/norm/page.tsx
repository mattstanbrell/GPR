"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../../amplify/data/resource";
import ReactMarkdown from "react-markdown";
import MentionsInput, {
	type StructuredMention,
	dummyChildData,
} from "../components/MentionsInput";
import React from "react";

const client = generateClient<Schema>();

type LangChainMessage = {
	role: "human" | "ai" | "tool";
	content: string;
	tool_call_id?: string;
	tool_calls?: Array<{
		id: string;
		type: "function";
		function: { name: string; arguments: string };
	}>;
};

type FormState = {
	caseNumber: number | null;
	reason: string;
	amount: number | null;
	dateRequired: {
		day: number | null;
		month: number | null;
		year: number | null;
	};
	firstName: string;
	lastName: string;
	address: {
		line1: string;
		line2: string;
		town: string;
		postcode: string;
	};
};

// For React's list rendering
type Message = LangChainMessage & {
	id: number;
	mentions?: StructuredMention[];
};

const convertToLangChainMessage = (msg: Message): LangChainMessage => {
	const { id, ...rest } = msg;
	return rest;
};

const createUserMessage = (
	content: string,
	mentions: StructuredMention[] = [],
): Message => ({
	id: Date.now(),
	role: "human",
	content,
	mentions,
});

const createAssistantMessage = (content: string): Message => ({
	id: Date.now(),
	role: "ai",
	content,
});

const createToolMessage = (content: string, tool_call_id: string): Message => ({
	id: Date.now(),
	role: "tool",
	content,
	tool_call_id,
});

// Helper type for nested form fields
type FormStateValue =
	| string
	| number
	| null
	| undefined
	| {
			day?: number | null;
			month?: number | null;
			year?: number | null;
			line1?: string;
			line2?: string;
			town?: string;
			postcode?: string;
	  };

const findUpdates = (
	current: FormState,
	previous: Partial<FormState>,
	path = "",
): string[] => {
	const updates: string[] = [];

	// Helper to check if a value should be considered empty
	const isEmpty = (value: FormStateValue) =>
		value === null || value === undefined || value === "";

	// Helper to check if values are different (accounting for empty values)
	const isDifferent = (curr: FormStateValue, prev: FormStateValue) =>
		!isEmpty(curr) && // Only consider non-empty current values
		curr !== prev && // Values must be different
		!isEmpty(prev); // Previous value must also be non-empty to count as a change

	for (const [key, value] of Object.entries(current)) {
		const fullPath = path ? `${path}.${key}` : key;
		if (typeof value === "object" && value !== null) {
			const prevValue = previous[key as keyof FormState];
			if (prevValue && typeof prevValue === "object") {
				// Compare nested objects
				for (const [nestedKey, nestedValue] of Object.entries(value)) {
					const nestedPath = `${fullPath}.${nestedKey}`;
					const prevNestedValue = (prevValue as Record<string, FormStateValue>)[
						nestedKey
					];
					if (isDifferent(nestedValue, prevNestedValue)) {
						updates.push(`${nestedPath} to ${nestedValue}`);
					}
				}
			}
		} else if (isDifferent(value, previous[key as keyof FormState])) {
			updates.push(`${fullPath} to ${value}`);
		}
	}
	return updates;
};

const findChangedFields = (
	oldData: FormState,
	newData: Partial<FormState>,
	prefix = "",
): string[] => {
	const changedFields: string[] = [];
	for (const [key, value] of Object.entries(newData)) {
		const fullPath = prefix ? `${prefix}.${key}` : key;
		if (typeof value === "object" && value !== null) {
			const oldValue = oldData[key as keyof FormState];
			if (oldValue && typeof oldValue === "object") {
				// Compare nested objects
				for (const [nestedKey, nestedValue] of Object.entries(value)) {
					const nestedPath = `${fullPath}.${nestedKey}`;
					const oldNestedValue = (oldValue as Record<string, FormStateValue>)[
						nestedKey
					];
					if (nestedValue !== oldNestedValue) {
						changedFields.push(nestedPath);
					}
				}
			}
		} else if (value !== oldData[key as keyof FormState]) {
			changedFields.push(fullPath);
		}
	}
	return changedFields;
};

export default function NormPage() {
	const [formData, setFormData] = useState<FormState>({
		caseNumber: null,
		reason: "",
		amount: null,
		dateRequired: {
			day: null,
			month: null,
			year: null,
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

	const [previousFormData, setPreviousFormData] = useState<FormState>({
		caseNumber: null,
		reason: "",
		amount: null,
		dateRequired: {
			day: null,
			month: null,
			year: null,
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

	const animateField = React.useCallback(
		(
			fieldName: string,
			newValue: string | number | null,
			oldValue: string | number | null,
		) => {
			// Only animate if the values are different
			if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
				setAnimatingFields((prev) => {
					const newSet = new Set(prev);
					newSet.add(fieldName);
					return newSet;
				});

				const timeoutId = setTimeout(() => {
					setAnimatingFields((prev) => {
						const newSet = new Set(prev);
						newSet.delete(fieldName);
						return newSet;
					});
				}, 3000);

				return () => clearTimeout(timeoutId);
			}
		},
		[],
	);

	// Update previous form data whenever form data changes
	useEffect(() => {
		setPreviousFormData(formData);
	}, [formData]);

	// Function to get nested value from form data
	const getNestedValue = (
		obj: FormState,
		path: string,
	): string | number | null => {
		const parts = path.split(".");
		let value: unknown = obj;

		for (const part of parts) {
			if (value && typeof value === "object" && part in value) {
				value = (value as Record<string, unknown>)[part];
			} else {
				return null;
			}
		}

		if (
			typeof value === "string" ||
			typeof value === "number" ||
			value === null
		) {
			return value;
		}
		return null;
	};

	// Function to safely animate field changes
	const safeAnimateField = (field: string) => {
		const newValue = getNestedValue(formData, field);
		const oldValue = getNestedValue(previousFormData, field);
		animateField(field, newValue, oldValue);
	};

	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [currentMentions, setCurrentMentions] = useState<StructuredMention[]>(
		[],
	);
	const [previousCaseNumber, setPreviousCaseNumber] = useState<number | null>(
		null,
	);

	const handleMessageSubmit = async () => {
		if (!message.trim()) return;

		// Create a message that includes mention metadata
		const userMessage = createUserMessage(message, currentMentions);

		// Get the previous state from the last response
		const previousState = messages
			.filter((msg) => msg.role === "ai")
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
				{} as Partial<FormState>,
			);

		// Find which fields were manually updated
		const updates = findUpdates(formData, previousState);

		// Create messages array with update note if needed
		const messagesToSend = [...messages];
		if (updates.length > 0) {
			messagesToSend.push(
				createUserMessage(
					`[Note: The following fields were manually updated: ${updates.join(", ")}. These updates have already been applied, no need to use the updateFormField tool.]`,
				),
			);
		}
		messagesToSend.push(userMessage);

		setMessages((prev) => [...prev, userMessage]);
		setLoading(true);
		setMessage("");
		setCurrentMentions([]);

		try {
			console.log(
				"Sending messages to norm:",
				messagesToSend.map(convertToLangChainMessage),
			);

			const response = await client.queries.norm({
				messages: messagesToSend.map((msg) => {
					const langChainMsg = convertToLangChainMessage(msg);
					// Ensure role is explicitly set in the stringified message
					return JSON.stringify({
						role: langChainMsg.role,
						content: langChainMsg.content,
						tool_call_id: langChainMsg.tool_call_id,
						tool_calls: langChainMsg.tool_calls,
					});
				}),
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
						safeAnimateField(field);
					}
				}

				// Add the assistant's response to messages
				const assistantMessage = createAssistantMessage(
					parsedResponse.message || "No response received",
				);
				setMessages((prev) => [...prev, assistantMessage]);
			} catch (error) {
				console.error("Error parsing response:", error);
				throw error;
			}
		} catch (error) {
			console.error("Error calling norm:", error);
			const errorMessage = createAssistantMessage(
				"Sorry, I encountered an error. Please try again.",
			);
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
				let newData: FormState;
				if (field.startsWith("date.")) {
					const datePart = field.split(".")[1];
					newData = {
						...prev,
						dateRequired: {
							...prev.dateRequired,
							[datePart]: value,
						},
					};
					// Compare old and new values for animation
					safeAnimateField(`dateRequired.${datePart}`);
				} else if (field.startsWith("address.")) {
					const addressPart = field.split(".")[1];
					newData = {
						...prev,
						address: {
							...prev.address,
							[addressPart]: value,
						},
					};
					// Compare old and new values for animation
					safeAnimateField(`address.${addressPart}`);
				} else {
					newData = {
						...prev,
						[field]: value,
					};
					// Compare old and new values for animation
					safeAnimateField(field);
				}
				return newData;
			});
		};

	// Function to render message content with highlighted mentions
	const renderMessageContent = React.useCallback((content: string) => {
		return content.split(/(\[\[CASE:\d+:[^\]]+\]\])/).map((part, i) => {
			const mentionMatch = part.match(/\[\[CASE:(\d+):([^\]]+)\]\]/);
			if (mentionMatch) {
				return (
					<span
						key={`mention-${mentionMatch[1]}-${i}`}
						style={{
							backgroundColor: "rgba(111, 0, 176, 0.1)", // Hounslow purple with low opacity
							padding: "0 2px",
							borderRadius: "2px",
						}}
					>
						{mentionMatch[2]}
					</span>
				);
			}
			return part;
		});
	}, []);

	return (
		<div style={{ height: "calc(100vh - 140px)", overflow: "hidden" }}>
			<style jsx>{`
				@keyframes highlight-agent {
					0% {
						background-color: transparent;
						box-shadow: none;
					}
					50% {
						background-color: #f0f7ff;
						box-shadow: none;
					}
					100% {
						background-color: transparent;
						box-shadow: none;
					}
				}

				@keyframes highlight-mention {
					0% {
						background-color: transparent;
						box-shadow: none;
					}
					50% {
						background-color: rgba(111, 0, 176, 0.1);
						box-shadow: none;
					}
					100% {
						background-color: transparent;
						box-shadow: none;
					}
				}

				.field-animation {
					animation: highlight-agent 1s ease-in-out forwards;
				}

				.field-animation-mention {
					animation: highlight-mention 1s ease-in-out forwards;
				}

				/* Add hover styles for tooltip */
				#caseNumber:hover + #case-number-tooltip {
					display: block !important;
				}

				/* Add focus styles for tooltip */
				#caseNumber:focus + #case-number-tooltip {
					display: block !important;
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
										<div style={{ position: "relative" }}>
											<input
												className={`govuk-input ${
													animatingFields.has("caseNumber")
														? formData.caseNumber === previousCaseNumber
															? "field-animation"
															: "field-animation-mention"
														: ""
												}`}
												id="caseNumber"
												name="caseNumber"
												type="text"
												value={formData.caseNumber?.toString() || ""}
												onChange={handleChange("caseNumber")}
												aria-describedby="case-number-tooltip"
											/>
											{formData.caseNumber && (
												<div
													id="case-number-tooltip"
													className="govuk-hint govuk-!-margin-top-1 govuk-!-margin-bottom-0"
													style={{
														position: "absolute",
														top: "100%",
														left: 0,
														backgroundColor: "#f3f2f1",
														padding: "15px",
														marginTop: "5px",
														zIndex: 100,
														display: "none",
														borderLeft: "5px solid #1d70b8",
														maxWidth: "calc(100% - 5px)",
														boxSizing: "border-box",
													}}
												>
													{(() => {
														const child = dummyChildData.find(
															(c) =>
																c.caseNumber ===
																formData.caseNumber?.toString(),
														);
														return child
															? `${child.name}, Age ${child.age}`
															: "Case not found";
													})()}
												</div>
											)}
										</div>
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
												value={formData.amount?.toString() || ""}
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
															value={
																formData.dateRequired.day?.toString() || ""
															}
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
															value={
																formData.dateRequired.month?.toString() || ""
															}
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
															value={
																formData.dateRequired.year?.toString() || ""
															}
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
								{messages
									.filter((msg) => msg.role !== "tool") // Filter out tool messages from UI
									.map((msg) => (
										<div
											key={msg.id}
											className={`govuk-inset-text ${
												msg.role === "ai" ? "govuk-inset-text--blue" : ""
											}`}
											style={{
												marginLeft: msg.role === "human" ? "auto" : "0",
												marginRight: msg.role === "ai" ? "auto" : "0",
												maxWidth: "80%",
												marginTop: 0,
												marginBottom: 0,
												backgroundColor:
													msg.role === "human" ? "#f3f2f1" : "#f0f7ff",
												borderColor:
													msg.role === "human" ? "#505a5f" : "#1d70b8",
												borderLeftWidth: msg.role === "ai" ? "5px" : "0",
												borderRightWidth: msg.role === "human" ? "5px" : "0",
												borderStyle: "solid",
												borderTop: "none",
												borderBottom: "none",
											}}
										>
											<ReactMarkdown
												className="govuk-body"
												components={{
													p: ({ children }) => (
														<p className="govuk-body" style={{ margin: 0 }}>
															{renderMessageContent(children.toString())}
														</p>
													),
													ul: ({ children }) => (
														<ul className="govuk-list govuk-list--bullet">
															{children}
														</ul>
													),
													li: ({ children }) => (
														<li className="govuk-body" style={{ margin: 0 }}>
															{children}
														</li>
													),
												}}
											>
												{msg.content}
											</ReactMarkdown>
										</div>
									))}
								{loading && (
									<div className="govuk-body" style={{ alignSelf: "center" }}>
										<span className="govuk-hint">Norm is typing...</span>
									</div>
								)}
							</div>
							<div className="govuk-form-group" style={{ marginBottom: 0 }}>
								<div style={{ display: "flex", gap: "10px", width: "100%" }}>
									<MentionsInput
										value={message}
										onChange={(newValue, mentions) => {
											setMessage(newValue);
											setCurrentMentions(mentions);

											// If a case was mentioned, update the form data
											const lastMention = mentions[mentions.length - 1];
											if (lastMention) {
												const caseNum = Number.parseInt(lastMention.id, 10);
												if (!Number.isNaN(caseNum)) {
													// Only store previous value if it exists and is different
													if (
														formData.caseNumber !== null &&
														formData.caseNumber !== caseNum
													) {
														setPreviousCaseNumber(formData.caseNumber);
													}
													setFormData((prev) => ({
														...prev,
														caseNumber: caseNum,
													}));
													safeAnimateField("caseNumber");
												}
											} else if (
												mentions.length === 0 &&
												previousCaseNumber !== null
											) {
												// Restore previous case number when all mentions are removed
												setFormData((prev) => ({
													...prev,
													caseNumber: previousCaseNumber,
												}));
												setPreviousCaseNumber(null);
											} else if (mentions.length === 0) {
												// If no mentions and no previous value, clear the case number
												setFormData((prev) => ({
													...prev,
													caseNumber: null,
												}));
											}
										}}
										onSubmit={handleMessageSubmit}
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.shiftKey) {
												e.preventDefault();
											}
										}}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
