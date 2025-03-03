"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../../../amplify/data/resource";
import ReactMarkdown from "react-markdown";
import { useRouter, useSearchParams } from "next/navigation";

// Use the Schema type but only include the fields we need for the form UI
type FormData = Pick<
	Schema["Form"]["type"],
	| "status"
	| "caseNumber"
	| "reason"
	| "amount"
	| "dateRequired"
	| "recipientDetails"
> & {
	id?: string;
};

// Message type for our UI
type UIMessage = { id: number; role: "user" | "assistant"; content: string };

// Single utility function to process messages - kept minimal to reduce code size
const processMessages = (messagesData: string | unknown): UIMessage[] => {
	try {
		const parsed =
			typeof messagesData === "string"
				? JSON.parse(messagesData)
				: messagesData;
		if (!Array.isArray(parsed)) return [];

		const timestamp = Date.now();
		return parsed
			.filter(
				(msg) =>
					msg.role === "user" || (msg.role === "assistant" && !msg.tool_calls),
			)
			.map((msg, i) => ({
				id: timestamp + i, // Consistent ID generation using timestamp + index
				role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
				content: msg.content || "",
			}));
	} catch (err) {
		console.error("Error processing messages:", err);
		return [];
	}
};

export default function NewFormPage() {
	console.log("NewFormPage component rendering");
	const router = useRouter();
	const searchParams = useSearchParams();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [form, setForm] = useState<FormData>({
		status: "DRAFT",
		caseNumber: "",
		reason: "",
		amount: 0,
		dateRequired: {
			day: null,
			month: null,
			year: null,
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
	const [userId, setUserId] = useState<string | null>(null);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<UIMessage[]>([]);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [processingMessage, setProcessingMessage] = useState(false);
	const [formCreated, setFormCreated] = useState(false);

	// Log URL parameters on client side
	useEffect(() => {
		const formId = searchParams.get("id");
		console.log("Client-side form ID from searchParams:", formId);
	}, [searchParams]);

	// Get the current user when the component mounts and check for existing form ID in URL
	useEffect(() => {
		console.log("useEffect running on component mount");

		async function getUserIdAndInitializeForm() {
			console.log("getUserIdAndInitializeForm function called");
			try {
				// Get the current user
				console.log("Getting current user");
				const user = await getCurrentUser();
				console.log("Current user:", user);
				setUserId(user.userId);

				// Check if there's a form ID in the URL using searchParams
				const formId = searchParams.get("id");
				console.log("Form ID from searchParams:", formId);

				if (formId) {
					// If form ID exists in URL, load that form
					console.log("Loading existing form with ID:", formId);
					await loadExistingForm(formId);
				} else {
					// Otherwise create a new form silently
					console.log("No form ID in URL, creating new form");
					await createFormSilently(user.userId);
				}
			} catch (err) {
				console.error("Error getting current user:", err);
				setError(err instanceof Error ? err.message : String(err));
			}
		}

		getUserIdAndInitializeForm();
	}, [searchParams]);

	// Load an existing form by ID
	const loadExistingForm = async (formId: string) => {
		try {
			console.log("loadExistingForm called with ID:", formId);
			const client = generateClient<Schema>();

			// Get the form by ID
			console.log("Fetching form from database");
			const { data: existingForm, errors } = await client.models.Form.get(
				{ id: formId },
				{ authMode: "userPool" },
			);

			console.log("Form fetch result:", existingForm, errors);

			if (errors || !existingForm) {
				console.error("Error loading form:", errors);
				return;
			}

			console.log("Setting form state with loaded form");
			// Set the form state with the loaded form - trust the data from the database
			setForm(existingForm as FormData);
			setFormCreated(true);
			console.log("Form loaded successfully");

			// Load the conversation for this form
			await loadConversation(formId);
		} catch (err) {
			console.error("Error loading existing form:", err);
			setError(err instanceof Error ? err.message : String(err));
		}
	};

	// Load conversation for a form
	const loadConversation = async (formId: string) => {
		try {
			console.log("loadConversation called for form ID:", formId);
			const client = generateClient<Schema>();

			// Get the NormConversation for this form
			console.log("Querying NormConversation with formID:", formId);
			const { data: conversationData, errors } =
				await client.models.NormConversation.list({
					filter: { formID: { eq: formId } },
					authMode: "userPool",
				});

			console.log("NormConversation query result:", {
				conversationData,
				errors,
			});

			if (errors) {
				console.error("Error loading conversation:", errors);
				return;
			}

			if (conversationData && conversationData.length > 0) {
				const conversation = conversationData[0];

				// Set the conversation ID
				setConversationId(conversation.id);

				// Parse the messages from the conversation
				if (conversation.messages) {
					const processedMessages = processMessages(conversation.messages);
					setMessages(processedMessages);
				}
			}
		} catch (err) {
			console.error("Error loading conversation:", err);
		}
	};

	// Handle form field changes - update state immediately, database only on blur
	const handleFormChange = (
		field: string,
		value: unknown,
		updateDb = false,
	) => {
		if (!form) return;

		// Update the form state
		setForm((prevForm) => {
			const newForm = { ...prevForm, [field]: value };

			// Update database only on blur (when updateDb is true) and if we have an ID
			if (updateDb && newForm.id) {
				updateFormInDatabase(newForm);
			}

			return newForm;
		});
	};

	// Create the form silently in the background
	const createFormSilently = async (userIdParam?: string) => {
		const effectiveUserId = userIdParam || userId;
		if (!effectiveUserId || formCreated) return;

		try {
			console.log("Creating form silently for user:", effectiveUserId);
			// Generate client
			const client = generateClient<Schema>();

			// Create a new form with DRAFT status
			const { data: newForm, errors } = await client.models.Form.create(
				{
					...form, // Use spread operator to include all form fields
					status: "DRAFT", // Ensure status is DRAFT
					userID: effectiveUserId, // Add the userID which isn't in our FormData type
				},
				{ authMode: "userPool" },
			);

			if (errors) {
				console.error("Error creating form:", errors);
				throw new Error(`Failed to create form: ${JSON.stringify(errors)}`);
			}

			if (!newForm) {
				throw new Error("Failed to create form: No form data returned");
			}

			console.log("Form created successfully with ID:", newForm.id);
			// Set the form state with the created form
			setForm({
				...form,
				id: newForm.id,
				status: newForm.status as
					| "DRAFT"
					| "SUBMITTED"
					| "AUTHORISED"
					| "VALIDATED"
					| "COMPLETED",
			});
			setFormCreated(true);

			// Update the URL with the form ID using Next.js router
			console.log("Updating URL with form ID:", newForm.id);
			const newUrl = `/form?id=${newForm.id}`;
			router.replace(newUrl);
			console.log("URL updated to:", newUrl);
		} catch (err) {
			console.error("Error creating new form:", err);
			setError(err instanceof Error ? err.message : String(err));
		}
	};

	// Update the form in the database
	const updateFormInDatabase = async (formToUpdate = form) => {
		if (!formToUpdate.id) return;

		try {
			// Generate client
			const client = generateClient<Schema>();

			// Create a properly typed object with a guaranteed id
			const updateData = {
				...formToUpdate,
				id: formToUpdate.id, // This ensures id is treated as a string, not string | undefined
			};

			// Update the form with current values
			const { errors } = await client.models.Form.update(updateData, {
				authMode: "userPool",
			});

			if (errors) {
				console.error("Error updating form:", errors);
			}
		} catch (err) {
			console.error("Error updating form:", err);
			// Don't set error state here to avoid disrupting the user experience
		}
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!form || !form.id) return;

		try {
			setLoading(true);

			const client = generateClient<Schema>();

			// Update the form with SUBMITTED status
			const { errors } = await client.models.Form.update(
				{
					id: form.id,
					status: "SUBMITTED",
				},
				{ authMode: "userPool" },
			);

			if (errors) {
				throw new Error(`Failed to update form: ${JSON.stringify(errors)}`);
			}

			// Redirect to form board using Next.js router
			router.push("/form-board");
		} catch (err) {
			console.error("Error submitting form:", err);
			setError(err instanceof Error ? err.message : String(err));
			setLoading(false);
		}
	};

	// Handle message submission to Norm
	const handleMessageSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!message.trim() || !form || !form.id || processingMessage) return;

		console.log("Submitting message with form ID:", form.id);
		console.log("Current conversation ID:", conversationId);
		console.log("Current form state:", form);

		setProcessingMessage(true);

		// Add user message to the UI
		const userMessage: UIMessage = {
			id: Date.now(),
			role: "user",
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
				messages.concat([userMessage]), // Include the new message
			);

			console.log("Calling Norm with payload:", {
				conversationID: conversationId,
				formID: form.id,
				messageCount: messages.length + 1,
				messagePayloadLength: messagePayload.length,
			});

			// Call the Norm function
			const { data: normResponse, errors } = await client.queries.Norm({
				conversationID: conversationId,
				messages: messagePayload,
				formID: form.id as string,
				currentFormState: JSON.stringify(form),
			});

			// Log the response for debugging
			console.log("normResponse", normResponse);
			console.log("normResponse.conversationID:", normResponse?.conversationID);

			if (errors) {
				throw new Error(`Error calling Norm: ${JSON.stringify(errors)}`);
			}

			// Save the conversation ID for future messages
			if (normResponse?.conversationID) {
				console.log("Setting conversation ID:", normResponse.conversationID);
				console.log("Previous conversation ID was:", conversationId);
				setConversationId(normResponse.conversationID);
			} else {
				console.warn("No conversation ID returned from Norm");
			}

			// Handle the response from Norm
			if (normResponse?.messages) {
				const formattedMessages = processMessages(normResponse.messages);

				// Add the followUp message if needed
				if (normResponse?.followUp && formattedMessages.length > 0) {
					const lastMsg = formattedMessages[formattedMessages.length - 1];
					if (lastMsg.role !== "assistant") {
						formattedMessages.push({
							id: Date.now() + formattedMessages.length,
							role: "assistant",
							content: normResponse.followUp || "",
						});
					}
				}

				if (formattedMessages.length > 0) {
					setMessages(formattedMessages);
				} else if (normResponse?.followUp) {
					// Fallback to just showing the followUp
					setMessages((prev) => [
						...prev,
						{
							id: Date.now(),
							role: "assistant",
							content: normResponse.followUp || "",
						},
					]);
				} else {
					// Last resort fallback
					setMessages((prev) => [
						...prev,
						{
							id: Date.now(),
							role: "assistant",
							content: "I'm sorry, I couldn't process your request.",
						},
					]);
				}
			} else if (normResponse?.followUp) {
				// Just add the followUp if no messages
				setMessages((prev) => [
					...prev,
					{
						id: Date.now(),
						role: "assistant",
						content: normResponse.followUp || "",
					},
				]);
			} else {
				// No messages or followUp
				setMessages((prev) => [
					...prev,
					{
						id: Date.now(),
						role: "assistant",
						content: "I'm sorry, I couldn't process your request.",
					},
				]);
			}

			// Update form state if provided by Norm
			if (normResponse?.currentFormState) {
				try {
					const updatedForm = JSON.parse(normResponse.currentFormState);
					if (updatedForm) {
						console.log("Updating form with data from Norm:", updatedForm);
						setForm(updatedForm);
					}
				} catch (parseError) {
					console.error("Error parsing form state from Norm:", parseError);
					// Simply log the error instead of attempting complex recovery
				}
			}
		} catch (err) {
			console.error("Error submitting message to Norm:", err);

			// Add error message
			const errorResponse: UIMessage = {
				id: Date.now(),
				role: "assistant",
				content:
					"Sorry, I encountered an error processing your request. Please try again.",
			};

			setMessages((prev) => [...prev, errorResponse]);
		} finally {
			setProcessingMessage(false);
		}
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
								onClick={() => router.push("/home")}
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
												onBlur={() =>
													handleFormChange(
														"caseNumber",
														form.caseNumber || "",
														true,
													)
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
												onBlur={() =>
													handleFormChange("reason", form.reason || "", true)
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
													onBlur={() =>
														handleFormChange("amount", form.amount || "", true)
													}
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
																value={
																	form.dateRequired?.day
																		? form.dateRequired.day.toString()
																		: ""
																}
																onChange={(e) => {
																	const value = e.target.value.trim();
																	const day = value
																		? Number.parseInt(value, 10)
																		: null;
																	handleFormChange("dateRequired", {
																		...form.dateRequired,
																		day,
																	});
																}}
																onBlur={() =>
																	handleFormChange(
																		"dateRequired",
																		form.dateRequired || {},
																		true,
																	)
																}
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
																	form.dateRequired?.month
																		? form.dateRequired.month.toString()
																		: ""
																}
																onChange={(e) => {
																	const value = e.target.value.trim();
																	const month = value
																		? Number.parseInt(value, 10)
																		: null;
																	handleFormChange("dateRequired", {
																		...form.dateRequired,
																		month,
																	});
																}}
																onBlur={() =>
																	handleFormChange(
																		"dateRequired",
																		form.dateRequired || {},
																		true,
																	)
																}
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
																	form.dateRequired?.year
																		? form.dateRequired.year.toString()
																		: ""
																}
																onChange={(e) => {
																	const value = e.target.value.trim();
																	const year = value
																		? Number.parseInt(value, 10)
																		: null;
																	handleFormChange("dateRequired", {
																		...form.dateRequired,
																		year,
																	});
																}}
																onBlur={() =>
																	handleFormChange(
																		"dateRequired",
																		form.dateRequired || {},
																		true,
																	)
																}
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
												onBlur={() =>
													handleFormChange(
														"recipientDetails",
														form.recipientDetails || {},
														true,
													)
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
												onBlur={() =>
													handleFormChange(
														"recipientDetails",
														form.recipientDetails || {},
														true,
													)
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
												onBlur={() =>
													handleFormChange(
														"recipientDetails",
														form.recipientDetails || {},
														true,
													)
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
												onBlur={() =>
													handleFormChange(
														"recipientDetails",
														form.recipientDetails || {},
														true,
													)
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
												onBlur={() =>
													handleFormChange(
														"recipientDetails",
														form.recipientDetails || {},
														true,
													)
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
												onBlur={() =>
													handleFormChange(
														"recipientDetails",
														form.recipientDetails || {},
														true,
													)
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
											msg.role === "assistant" ? "govuk-inset-text--purple" : ""
										}`}
										style={{
											marginLeft: msg.role === "user" ? "auto" : "0",
											marginRight: msg.role === "assistant" ? "auto" : "0",
											maxWidth: "80%",
											marginTop: 0,
											marginBottom: 0,
											backgroundColor:
												msg.role === "user"
													? "#f3f2f1"
													: "var(--color-background-light)",
											borderColor:
												msg.role === "user"
													? "#505a5f"
													: "var(--hounslow-primary)",
											borderLeftWidth: msg.role === "assistant" ? "5px" : "0",
											borderRightWidth: msg.role === "user" ? "5px" : "0",
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
																msg.role === "assistant"
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
										marginBottom: "10px",
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
