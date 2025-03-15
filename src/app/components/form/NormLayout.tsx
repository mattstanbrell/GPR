import ReactMarkdown from "react-markdown";
import type { UIMessage, FormChanges } from "./types";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../../../amplify/data/resource";
import { useState, type Dispatch, type SetStateAction } from "react";

interface NormLayoutProps {
	messages: UIMessage[];
	message: string;
	setMessage: (message: string) => void;
	setMessages: Dispatch<SetStateAction<UIMessage[]>>;
	formId: string | undefined;
	conversationId: string | null;
	onConversationIdChange: (id: string) => void;
	onFormUpdate: (updatedForm: Partial<Schema["Form"]["type"]>) => void;
	currentForm: Partial<Schema["Form"]["type"]>;
	processingMessage: boolean;
	setProcessingMessage: (processing: boolean) => void;
	getFormChanges: () => FormChanges | null;
}

interface SystemMessage {
	role: "system";
	content: string;
}

interface NormMessage {
	role: "system" | "user" | "assistant";
	content: string;
	id?: number;
}

// Type guard for system messages
const isSystemMessage = (message: NormMessage): message is SystemMessage => {
	return message.role === "system";
};

export function NormLayout({
	messages,
	message,
	setMessage,
	setMessages,
	formId,
	conversationId,
	onConversationIdChange,
	onFormUpdate,
	currentForm,
	processingMessage,
	setProcessingMessage,
	getFormChanges,
}: NormLayoutProps) {
	const [systemPrompt, setSystemPrompt] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Function to render message content
	const renderMessageContent = (content: string): string => {
		if (!content) return "";
		const followUpMatch = content.match(/"followUp"\s*:\s*"([^"]*?)"/);
		if (followUpMatch?.[1]) {
			return followUpMatch[1].replace(/\\"/g, '"');
		}
		return content;
	};

	// Helper function to detect payment method changes
	const detectPaymentMethodChange = (
		currentForm: Partial<Schema["Form"]["type"]>,
		updatedForm: Partial<Schema["Form"]["type"]>,
	): boolean => {
		return currentForm.paymentMethod !== updatedForm.paymentMethod;
	};

	const handleNormMessageSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!message.trim() || !formId || processingMessage) return;

		setProcessingMessage(true);

		// Check for form changes
		const formChanges = getFormChanges();
		const userMessage: UIMessage = {
			id: Date.now(),
			role: "user",
			content: message,
		};

		setMessages((prev) => [...prev, userMessage]);
		setMessage("");

		try {
			const client = generateClient<Schema>();

			// If there are form changes, insert them just before the new user message
			const messagesPayload = formChanges
				? JSON.stringify(
						[
							systemPrompt
								? {
										role: "system",
										content: systemPrompt,
									}
								: null,
							...messages, // Include all previous messages
							{
								role: "system",
								content: `User manually changed the following fields: ${Object.entries(formChanges)
									.map(([field, { from, to }]) => {
										// Special handling for payment method changes
										if (field === "paymentMethod") {
											return `${field}: from ${from || "undefined"} to ${to || "undefined"} (This changes the form type)`;
										}
										return `${field}: from ${JSON.stringify(from)} to ${JSON.stringify(to)}`;
									})
									.join(", ")}`,
							},
							userMessage,
						].filter(Boolean),
					)
				: JSON.stringify(
						[
							systemPrompt
								? {
										role: "system",
										content: systemPrompt,
									}
								: null,
							...messages,
							userMessage,
						].filter(Boolean),
					);

			const { data: normResponse } = await client.queries.Norm({
				conversationID: conversationId,
				messages: messagesPayload,
				formID: formId,
				currentFormState: JSON.stringify({
					...currentForm,
					// Ensure payment method is explicitly included
					paymentMethod: currentForm.paymentMethod || "PREPAID_CARD",
				}),
			});

			if (!normResponse) {
				throw new Error("Error calling Norm: No response received");
			}

			if (normResponse?.conversationID) {
				onConversationIdChange(normResponse.conversationID);
			}

			try {
				if (normResponse?.messages) {
					const formattedMessages = processMessages(normResponse.messages);
					if (formattedMessages.length > 0) {
						// Store the system prompt if this is our first message
						const firstMessage = formattedMessages[0];
						if (messages.length === 0 && isSystemMessage(firstMessage)) {
							setSystemPrompt(firstMessage.content);
						}
						// Add only the assistant's response
						const lastMessage = formattedMessages[formattedMessages.length - 1];
						if (lastMessage.role === "assistant") {
							setMessages((prev: UIMessage[]) => [
								...prev,
								{
									id: Date.now(),
									role: "assistant",
									content: lastMessage.content,
								},
							]);
						}
					} else {
						setMessages((prev: UIMessage[]) => [
							...prev,
							{
								id: Date.now(),
								role: "assistant",
								content: "I'm sorry, I couldn't process your request.",
							},
						]);
					}
				} else {
					setMessages((prev: UIMessage[]) => [
						...prev,
						{
							id: Date.now(),
							role: "assistant",
							content: "I'm sorry, I couldn't process your request.",
						},
					]);
				}

				if (normResponse?.currentFormState) {
					const updatedForm = JSON.parse(normResponse.currentFormState);
					if (updatedForm) {
						// Check if payment method has changed
						const paymentMethodChanged = detectPaymentMethodChange(currentForm, updatedForm);

						// Only update if Norm actually changed something or payment method changed
						const hasChanges =
							paymentMethodChanged ||
							Object.keys(updatedForm as Partial<Schema["Form"]["type"]>).some(
								(key) =>
									JSON.stringify(
										(updatedForm as Partial<Schema["Form"]["type"]>)[key as keyof Partial<Schema["Form"]["type"]>],
									) !== JSON.stringify(currentForm[key as keyof Partial<Schema["Form"]["type"]>]),
							);

						if (hasChanges) {
							// If payment method changed, add a system message explaining the change
							if (paymentMethodChanged) {
								setMessages((prev: UIMessage[]) => [
									...prev,
									{
										id: Date.now(),
										role: "assistant",
										content: `I've updated the payment method to ${
											updatedForm.paymentMethod === "PURCHASE_ORDER" ? "Purchase Order" : "Prepaid Card"
										}. ${
											updatedForm.paymentMethod === "PURCHASE_ORDER"
												? "I'll now ask for business details instead of recipient details."
												: "I'll now ask for recipient details instead of business details."
										}`,
									},
								]);
							}

							onFormUpdate(updatedForm);
						}
					}
				}
			} catch (error: unknown) {
				console.error("Failed to load messages:", error);
				setErrorMessage("Failed to load messages. Please try again.");
				setMessages((prev: UIMessage[]) => [
					...prev,
					{
						id: Date.now(),
						role: "assistant",
						content: "Sorry, I encountered an error processing the response. Please try again.",
					},
				]);
			}
		} catch (error: unknown) {
			console.error("Failed to send message:", error);
			setErrorMessage("Failed to send message. Please try again.");
			setMessages((prev: UIMessage[]) => [
				...prev,
				{
					id: Date.now(),
					role: "assistant",
					content: "Sorry, I encountered an error processing your request. Please try again.",
				},
			]);
		} finally {
			setProcessingMessage(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleNormMessageSubmit(e);
		}
	};

	// Helper function to process messages
	const processMessages = (messagesString: string): NormMessage[] => {
		try {
			return JSON.parse(messagesString);
		} catch {
			return [];
		}
	};

	return (
		<>
			<style jsx>{`
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
				
				.error-message {
					color: #d4351c;
					margin-bottom: 15px;
				}
			`}</style>
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
				{errorMessage && <div className="govuk-error-message error-message">{errorMessage}</div>}
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
							className={`govuk-inset-text ${msg.role === "assistant" ? "govuk-inset-text--purple" : ""}`}
							style={{
								marginLeft: msg.role === "user" ? "auto" : "0",
								marginRight: msg.role === "assistant" ? "auto" : "0",
								maxWidth: "80%",
								marginTop: 0,
								marginBottom: 0,
								backgroundColor: msg.role === "user" ? "#f3f2f1" : "var(--color-background-light)",
								borderLeftWidth: msg.role === "assistant" ? "5px" : "0",
								borderRightWidth: msg.role === "user" ? "5px" : "0",
								borderTopWidth: "0",
								borderBottomWidth: "0",
								borderLeftStyle: "solid",
								borderRightStyle: "solid",
								borderTopStyle: "solid",
								borderBottomStyle: "solid",
								borderLeftColor: msg.role === "user" ? "#505a5f" : "var(--hounslow-primary)",
								borderRightColor: msg.role === "user" ? "#505a5f" : "var(--hounslow-primary)",
								borderTopColor: msg.role === "user" ? "#505a5f" : "var(--hounslow-primary)",
								borderBottomColor: msg.role === "user" ? "#505a5f" : "var(--hounslow-primary)",
							}}
						>
							<ReactMarkdown
								components={{
									p: ({ children }) => (
										<p
											className="govuk-body"
											style={{
												margin: 0,
												color: msg.role === "assistant" ? "var(--color-button-primary)" : "inherit",
											}}
										>
											{renderMessageContent(String(children) ?? "")}
										</p>
									),
									ul: ({ children }) => <ul className="govuk-list govuk-list--bullet">{children}</ul>,
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
								borderLeftWidth: "5px",
								borderRightWidth: "0",
								borderTopWidth: "0",
								borderBottomWidth: "0",
								borderLeftStyle: "solid",
								borderRightStyle: "solid",
								borderTopStyle: "solid",
								borderBottomStyle: "solid",
								borderLeftColor: "var(--hounslow-primary)",
								borderRightColor: "var(--hounslow-primary)",
								borderTopColor: "var(--hounslow-primary)",
								borderBottomColor: "var(--hounslow-primary)",
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
							background: "linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9))",
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
		</>
	);
}
