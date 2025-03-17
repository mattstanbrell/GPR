import ReactMarkdown from "react-markdown";
import type { UIMessage, FormChanges } from "./types";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../../../amplify/data/resource";
import { useState, type Dispatch, type SetStateAction, useRef, useEffect } from "react";
import Image from "next/image";

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
	isMobile?: boolean;
	onToggle?: () => void;
	isFormValid?: boolean;
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
	isMobile,
	onToggle,
	isFormValid,
}: NormLayoutProps) {
	const [systemPrompt, setSystemPrompt] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close the menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const renderMessageContent = (content: string): string => {
		if (!content) return "";
		const followUpMatch = content.match(/"followUp"\s*:\s*"([^"]*?)"/);
		if (followUpMatch?.[1]) {
			return followUpMatch[1].replace(/\\"/g, '"');
		}
		return content;
	};

	const detectPaymentMethodChange = (
		currentForm: Partial<Schema["Form"]["type"]>,
		updatedForm: Partial<Schema["Form"]["type"]>,
	): boolean => {
		return currentForm.expenseType !== updatedForm.expenseType;
	};

	const handleNormMessageSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!message.trim() || !formId || processingMessage) return;

		setProcessingMessage(true);

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

			const messagesPayload = formChanges
				? JSON.stringify(
						[
							systemPrompt
								? {
										role: "system",
										content: systemPrompt,
									}
								: null,
							...messages,
							{
								role: "system",
								content: `User manually changed the following fields: ${Object.entries(formChanges)
									.map(([field, { from, to }]) => {
										if (field === "paymentMethod") {
											return `${field}: from ${from || "undefined"} to ${
												to || "undefined"
											} (This changes the form type)`;
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
						const firstMessage = formattedMessages[0];
						if (messages.length === 0 && isSystemMessage(firstMessage)) {
							setSystemPrompt(firstMessage.content);
						}
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
						const paymentMethodChanged = detectPaymentMethodChange(currentForm, updatedForm);

						const hasChanges =
							paymentMethodChanged ||
							Object.keys(updatedForm as Partial<Schema["Form"]["type"]>).some(
								(key) =>
									JSON.stringify(
										(updatedForm as Partial<Schema["Form"]["type"]>)[key as keyof Partial<Schema["Form"]["type"]>],
									) !== JSON.stringify(currentForm[key as keyof Partial<Schema["Form"]["type"]>]),
							);

						if (hasChanges) {
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
          0% {
            opacity: 0.2;
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0.2;
          }
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
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					paddingLeft: isMobile ? "0" : "15px",
					paddingRight: "0",
					float: "left",
					boxSizing: "border-box",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						...(isMobile && {
							borderBottom: "1px solid #b1b4b6",
							paddingBottom: "15px",
							marginBottom: "15px",
						}),
					}}
				>
					<h2
						className="govuk-heading-l"
						style={{
							margin: 0,
							display: "flex",
							alignItems: "center",
						}}
					>
						Norm
					</h2>
					{isMobile && onToggle && (
						<div ref={menuRef} style={{ position: "relative" }}>
							<Image
								src="/more-options.svg"
								alt="Menu"
								width={24}
								height={24}
								onClick={() => setMenuOpen(!menuOpen)}
								style={{
									cursor: "pointer",
									filter: "var(--color-button-primary-filter)",
								}}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										setMenuOpen(!menuOpen);
									}
								}}
							/>

							{menuOpen && (
								<div
									style={{
										position: "absolute",
										right: 0,
										top: "100%",
										marginTop: "5px",
										backgroundColor: "#fff",
										border: "1px solid #b1b4b6",
										borderRadius: "4px",
										boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
										zIndex: 100,
										width: "150px",
									}}
								>
									<button
										type="button"
										onClick={() => {
											onToggle();
											setMenuOpen(false);
										}}
										style={{
											display: "flex",
											alignItems: "center",
											padding: "10px 15px",
											width: "100%",
											textAlign: "left",
											border: "none",
											backgroundColor: "transparent",
											cursor: "pointer",
											borderRadius: "4px",
											gap: "8px",
										}}
										aria-label="Switch to Form view"
									>
										<Image
											src="/file.svg"
											alt=""
											width={18}
											height={18}
											style={{ filter: "var(--color-button-primary-filter)" }}
										/>
										<span>Form</span>
									</button>
								</div>
							)}
						</div>
					)}
				</div>
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
					{isMobile && (
						<div style={{ display: "flex", gap: "10px" }}>
							{onToggle && (
								<button
									type="button"
									onClick={onToggle}
									className="govuk-button govuk-button--secondary"
									style={{
										marginTop: "10px",
										flex: "1",
										opacity: isFormValid ? 1 : 0.5,
										backgroundColor: isFormValid ? "var(--color-button-secondary)" : "#dddddd",
										transition: "background-color 0.3s ease, opacity 0.3s ease",
										borderColor: isFormValid ? "var(--color-button-secondary)" : "#dddddd",
									}}
									disabled={!isFormValid}
									aria-label="Review form before submitting"
								>
									Review Form
								</button>
							)}
							<button
								type="button"
								onClick={handleNormMessageSubmit}
								className="govuk-button"
								style={{ marginTop: "10px", flex: "1" }}
								disabled={processingMessage}
							>
								Send
							</button>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
