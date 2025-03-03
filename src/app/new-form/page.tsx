"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../../../amplify/data/resource";
import ReactMarkdown from "react-markdown";

export default function NewFormPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [form, setForm] = useState<Schema["Form"]["type"] | null>(null);
	const [userId, setUserId] = useState<string | null>(null);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<
		Array<{ id: number; role: "human" | "ai"; content: string }>
	>([]);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [processingMessage, setProcessingMessage] = useState(false);

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

	// Handle message submission to Norm
	const handleMessageSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!message.trim() || !form || processingMessage) return;

		setProcessingMessage(true);

		// Add user message to the UI
		const userMessage = {
			id: Date.now(),
			role: "human" as const,
			content: message,
		};

		setMessages((prev) => [...prev, userMessage]);
		setMessage("");

		try {
			// Generate client
			const client = generateClient<Schema>();

			// Prepare the message for the Norm function
			// We need to send the entire message history
			const messagePayload = JSON.stringify(
				messages
					.map((msg) => ({
						role: msg.role === "human" ? "user" : "assistant",
						content: msg.content,
					}))
					.concat([
						{
							role: "user",
							content: message,
						},
					]),
			);

			// Call the Norm function
			const { data: normResponse, errors } = await client.queries.Norm({
				conversationID: conversationId,
				messages: messagePayload,
				formID: form.id,
				currentFormState: JSON.stringify(form),
			});

			// Log the response for debugging
			console.log("normResponse", normResponse);

			if (errors) {
				throw new Error(`Error calling Norm: ${JSON.stringify(errors)}`);
			}

			// Save the conversation ID for future messages
			if (normResponse?.conversationID) {
				setConversationId(normResponse.conversationID);
			}

			// Handle the response from Norm
			if (normResponse?.messages) {
				try {
					// If messages is a string, parse it; otherwise, use it directly
					const messageHistory =
						typeof normResponse.messages === "string"
							? JSON.parse(normResponse.messages)
							: normResponse.messages;

					if (Array.isArray(messageHistory) && messageHistory.length > 0) {
						// Filter out system messages, tool calls, and other technical details
						// Only keep user messages and AI responses without tool_calls
						const filteredMessages = messageHistory.filter(
							(msg) =>
								msg.role === "user" ||
								(msg.role === "assistant" && !msg.tool_calls),
						);

						// Convert OpenAI format to our format with IDs
						const formattedMessages = filteredMessages.map((msg, index) => ({
							id: Date.now() + index,
							role: msg.role === "user" ? ("human" as const) : ("ai" as const),
							content: msg.content || "",
						}));

						// Add the latest followUp message if it's not already included
						const lastMessage = filteredMessages[filteredMessages.length - 1];
						if (
							normResponse?.followUp &&
							(!lastMessage || lastMessage.role !== "assistant")
						) {
							formattedMessages.push({
								id: Date.now() + filteredMessages.length,
								role: "ai" as const,
								content: normResponse.followUp,
							});
						}

						setMessages(formattedMessages);
					} else {
						// If messageHistory is not an array or is empty, just add the follow-up message
						const aiResponse = {
							id: Date.now(),
							role: "ai" as const,
							content:
								normResponse?.followUp ||
								"I'm sorry, I couldn't process your request.",
						};
						setMessages((prev) => [...prev, aiResponse]);
					}
				} catch (parseError) {
					console.error("Error parsing message history:", parseError);

					// If we can't parse the message history, just add the AI response
					const aiResponse = {
						id: Date.now(),
						role: "ai" as const,
						content:
							normResponse?.followUp ||
							"I'm sorry, I couldn't process your request.",
					};
					setMessages((prev) => [...prev, aiResponse]);
				}
			} else {
				// If no message history is returned, just add the AI response with the follow-up message
				const aiResponse = {
					id: Date.now(),
					role: "ai" as const,
					content:
						normResponse?.followUp ||
						"I'm sorry, I couldn't process your request.",
				};
				setMessages((prev) => [...prev, aiResponse]);
			}

			// If the response includes form updates, apply them
			if (normResponse?.currentFormState) {
				try {
					// Parse the form state - it should now be proper JSON
					const updatedForm = JSON.parse(normResponse.currentFormState);
					if (updatedForm) {
						setForm(updatedForm);
					}
				} catch (parseError) {
					console.error("Error parsing updated form state:", parseError);
					// If JSON parsing fails for some reason, fall back to manual parsing
					parseFormStateManually(normResponse.currentFormState);
				}
			}
		} catch (err) {
			console.error("Error submitting message to Norm:", err);

			// Add error message
			const errorResponse = {
				id: Date.now(),
				role: "ai" as const,
				content:
					"Sorry, I encountered an error processing your request. Please try again.",
			};

			setMessages((prev) => [...prev, errorResponse]);
		} finally {
			setProcessingMessage(false);
		}
	};

	// Helper function to manually parse the form state string
	const parseFormStateManually = (updatedFormString: string) => {
		if (!form) return;

		// Extract the main form fields we care about
		const extractValue = (key: string, str: string): string | null => {
			const regex = new RegExp(`${key}=([^,}]+)`);
			const match = str.match(regex);
			return match ? match[1] : null;
		};

		// Extract nested objects
		const extractObject = (prefix: string, str: string): string | null => {
			const regex = new RegExp(`${prefix}=\\{([^}]+)\\}`);
			const match = str.match(regex);
			return match ? match[1] : null;
		};

		// Extract the main fields
		const id = extractValue("id", updatedFormString);
		const caseNumber = extractValue("caseNumber", updatedFormString);
		const reason = extractValue("reason", updatedFormString);
		const amount = extractValue("amount", updatedFormString);
		const statusValue = extractValue("status", updatedFormString);

		// Ensure status is one of the allowed values
		const status =
			statusValue &&
			["DRAFT", "SUBMITTED", "AUTHORISED", "VALIDATED", "COMPLETED"].includes(
				statusValue,
			)
				? (statusValue as
						| "DRAFT"
						| "SUBMITTED"
						| "AUTHORISED"
						| "VALIDATED"
						| "COMPLETED")
				: form.status;

		// Extract nested objects
		const dateRequiredStr = extractObject("dateRequired", updatedFormString);
		const dateRequired = dateRequiredStr
			? {
					day: Number.parseInt(extractValue("day", dateRequiredStr) || "0", 10),
					month: Number.parseInt(
						extractValue("month", dateRequiredStr) || "0",
						10,
					),
					year: Number.parseInt(
						extractValue("year", dateRequiredStr) || "0",
						10,
					),
				}
			: form.dateRequired;

		// Extract recipient details
		const recipientDetailsStr = extractObject(
			"recipientDetails",
			updatedFormString,
		);
		let recipientDetails = form.recipientDetails || {
			name: { firstName: "", lastName: "" },
			address: { lineOne: "", lineTwo: "", townOrCity: "", postcode: "" },
		};

		if (recipientDetailsStr) {
			const nameStr = extractObject("name", recipientDetailsStr);
			const addressStr = extractObject("address", recipientDetailsStr);

			const name = nameStr
				? {
						firstName: extractValue("firstName", nameStr) || "",
						lastName: extractValue("lastName", nameStr) || "",
					}
				: recipientDetails.name;

			const address = addressStr
				? {
						lineOne: extractValue("lineOne", addressStr) || "",
						lineTwo: extractValue("lineTwo", addressStr) || "",
						townOrCity: extractValue("townOrCity", addressStr) || "",
						postcode: extractValue("postcode", addressStr) || "",
					}
				: recipientDetails.address;

			recipientDetails = { name, address };
		}

		// Update the form with the extracted values
		const updatedForm = {
			...form,
			id: id || form.id,
			caseNumber: caseNumber || form.caseNumber,
			reason: reason || form.reason,
			amount: amount ? Number.parseFloat(amount) : form.amount,
			dateRequired,
			recipientDetails,
			status,
		};

		setForm(updatedForm);
	};

	// Function to handle key down events for the message input
	const handleKeyDown = (e: React.KeyboardEvent) => {
		// Submit on Enter (without Shift)
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleMessageSubmit(e as unknown as React.FormEvent);
		}
		// Allow new line on Shift+Enter (default textarea behavior)
	};

	// Function to render message content
	const renderMessageContent = (content: string): string => {
		// Early return if content is not a string or is empty
		if (!content) return "";

		// Try regex approach first - most reliable for our use case
		const followUpMatch = content.match(/"followUp"\s*:\s*"([^"]*?)"/);
		if (followUpMatch?.[1]) {
			return followUpMatch[1].replace(/\\"/g, '"');
		}

		// Try JSON parsing as fallback
		if (content.trim().startsWith("{")) {
			try {
				const parsed = JSON.parse(content);
				if (parsed && typeof parsed === "object" && parsed.followUp) {
					return String(parsed.followUp);
				}
			} catch {
				// Parsing failed, continue to return original content
			}
		}

		// Return original content if no followUp found
		return content;
	};

	// Function to validate if all required fields are filled out
	const isFormValid = (): boolean => {
		if (!form) return false;

		// Check required fields
		if (!form.caseNumber?.trim()) return false;
		if (!form.reason?.trim()) return false;
		if (!form.amount || form.amount <= 0) return false;

		// Check date required
		if (
			!form.dateRequired?.day ||
			!form.dateRequired?.month ||
			!form.dateRequired?.year
		)
			return false;

		// Check recipient details - name
		if (!form.recipientDetails?.name?.firstName?.trim()) return false;
		if (!form.recipientDetails?.name?.lastName?.trim()) return false;

		// Check recipient details - address
		if (!form.recipientDetails?.address?.lineOne?.trim()) return false;
		if (!form.recipientDetails?.address?.townOrCity?.trim()) return false;
		if (!form.recipientDetails?.address?.postcode?.trim()) return false;

		return true;
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
				
				.button-container {
					position: relative;
					display: flex;
					justify-content: center;
					padding: 15px 0;
				}
				
				.button-container::before {
					content: "";
					position: absolute;
					top: -30px;
					left: 0;
					right: 0;
					height: 30px;
					background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9));
					pointer-events: none;
				}
				
				.button-container::after {
					content: "";
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					height: 100%;
					background: rgba(255, 255, 255, 0.8);
					backdrop-filter: blur(5px);
					z-index: -1;
					border-top: 1px solid rgba(177, 180, 182, 0.3);
				}

				@keyframes blink {
					0% { opacity: 0.2; }
					20% { opacity: 1; }
					100% { opacity: 0.2; }
				}
				
				.typing-indicator {
					display: inline-flex;
					align-items: center;
				}
				
				.dot {
					display: inline-block;
					width: 8px;
					height: 8px;
					border-radius: 50%;
					background-color: var(--hounslow-primary);
					margin-right: 4px;
					animation: blink 1.4s infinite both;
				}
				
				.dot:nth-child(2) {
					animation-delay: 0.2s;
				}
				
				.dot:nth-child(3) {
					animation-delay: 0.4s;
				}
				
				.govuk-inset-text--purple {
					background-color: var(--color-background-light);
					border-color: var(--hounslow-primary);
					border-left-width: 5px;
				}
			`}</style>

			<main
				className="govuk-main-wrapper"
				style={{ height: "100%", padding: "0" }}
			>
				<div
					className="govuk-width-container"
					style={{ height: "100%", paddingLeft: "15px", paddingRight: "15px" }}
				>
					<div className="govuk-grid-row" style={{ height: "100%", margin: 0 }}>
						{/* Left side - Form Section */}
						<div
							style={{
								width: "60%",
								borderRight: "1px solid #b1b4b6",
								paddingRight: "0",
								paddingLeft: "15px",
								height: "100%",
								display: "flex",
								flexDirection: "column",
								float: "left",
								boxSizing: "border-box",
							}}
						>
							<h1 className="govuk-heading-l" style={{ marginLeft: "3px" }}>
								Form
							</h1>
							<div
								style={{ flexGrow: 1, overflowY: "auto", paddingRight: "0" }}
							>
								<form
									onSubmit={handleSubmit}
									style={{ paddingRight: "20px", paddingLeft: "3px" }}
								>
									<fieldset className="govuk-fieldset">
										<legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
											<h2 className="govuk-fieldset__heading">
												Expense details
											</h2>
										</legend>

										<div className="govuk-form-group">
											<label className="govuk-label" htmlFor="caseNumber">
												Case number
											</label>
											<input
												className="govuk-input govuk-input--width-20"
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
												onChange={(e) =>
													handleFormChange("reason", e.target.value)
												}
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
																value={
																	form.dateRequired?.month?.toString() || ""
																}
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
																value={
																	form.dateRequired?.year?.toString() || ""
																}
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
								</form>
							</div>
							<div className="button-container">
								<button
									type="submit"
									className="govuk-button"
									onClick={handleSubmit}
									disabled={!isFormValid() || loading}
									style={{
										marginBottom: 0,
										position: "relative",
										zIndex: 1,
										opacity: isFormValid() ? 1 : 0.5,
										cursor: isFormValid() ? "pointer" : "not-allowed",
									}}
								>
									{loading ? "Submitting..." : "Submit"}
								</button>
							</div>
						</div>

						{/* Right side - Norm Chat Interface */}
						<div
							style={{
								width: "40%",
								height: "100%",
								display: "flex",
								flexDirection: "column",
								paddingLeft: "20px",
								paddingRight: "15px",
								float: "left",
								boxSizing: "border-box",
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
											msg.role === "ai" ? "govuk-inset-text--purple" : ""
										}`}
										style={{
											marginLeft: msg.role === "human" ? "auto" : "0",
											marginRight: msg.role === "ai" ? "auto" : "0",
											maxWidth: "80%",
											marginTop: 0,
											marginBottom: 0,
											backgroundColor:
												msg.role === "human"
													? "#f3f2f1"
													: "var(--color-background-light)",
											borderColor:
												msg.role === "human"
													? "#505a5f"
													: "var(--hounslow-primary)",
											borderLeftWidth: msg.role === "ai" ? "5px" : "0",
											borderRightWidth: msg.role === "human" ? "5px" : "0",
											borderStyle: "solid",
											borderTop: "none",
											borderBottom: "none",
										}}
									>
										<ReactMarkdown
											components={{
												p: ({ children }) => (
													<p
														className="govuk-body"
														style={{
															margin: 0,
															color:
																msg.role === "ai"
																	? "var(--color-button-primary)"
																	: "inherit",
														}}
													>
														{renderMessageContent(children?.toString() ?? "")}
													</p>
												),
												ul: ({ children }) => (
													<ul className="govuk-list govuk-list--bullet">
														{children ?? ""}
													</ul>
												),
												li: ({ children }) => (
													<li className="govuk-body" style={{ margin: 0 }}>
														{children ?? ""}
													</li>
												),
											}}
										>
											{msg.content}
										</ReactMarkdown>
									</div>
								))}

								{processingMessage && (
									<div
										className="govuk-inset-text govuk-inset-text--purple"
										style={{
											marginLeft: "0",
											marginRight: "auto",
											maxWidth: "80%",
											marginTop: 0,
											marginBottom: 0,
											backgroundColor: "var(--color-background-light)",
											borderColor: "var(--hounslow-primary)",
											borderLeftWidth: "5px",
											borderRightWidth: "0",
											borderStyle: "solid",
											borderTop: "none",
											borderBottom: "none",
										}}
									>
										<p className="govuk-body" style={{ margin: 0 }}>
											<span className="typing-indicator">
												<span className="dot" />
												<span className="dot" />
												<span className="dot" />
											</span>
										</p>
									</div>
								)}
							</div>

							<div
								style={{
									position: "relative",
									background: "rgba(255, 255, 255, 0.8)",
									backdropFilter: "blur(5px)",
									padding: "15px 0 0 0",
									borderTop: "1px solid rgba(177, 180, 182, 0.3)",
								}}
							>
								<div
									style={{
										position: "absolute",
										top: "-30px",
										left: 0,
										right: 0,
										height: "30px",
										background:
											"linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9))",
										pointerEvents: "none",
									}}
								/>
								{processingMessage && (
									<div style={{ marginBottom: "10px", textAlign: "center" }}>
										<span className="govuk-body-s" style={{ color: "#505a5f" }}>
											Norm is thinking...
										</span>
									</div>
								)}
								<textarea
									className="govuk-textarea"
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									onKeyDown={handleKeyDown}
									rows={4}
									style={{
										resize: "none",
										height: "100px",
										width: "100%",
										padding: "10px",
										position: "relative",
										zIndex: 1,
										margin: "10px",
									}}
									placeholder="Type your message here..."
									disabled={processingMessage}
								/>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
