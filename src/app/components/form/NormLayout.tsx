import ReactMarkdown from "react-markdown";
import type { UIMessage } from "./types";
import type { FormData } from "./types";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../../../amplify/data/resource";
import type { Dispatch, SetStateAction } from "react";

interface NormLayoutProps {
	messages: UIMessage[];
	message: string;
	setMessage: (message: string) => void;
	setMessages: Dispatch<SetStateAction<UIMessage[]>>;
	formId: string | undefined;
	conversationId: string | null;
	onConversationIdChange: (id: string) => void;
	onFormUpdate: (updatedForm: FormData) => void;
	currentForm: FormData;
	processingMessage: boolean;
	setProcessingMessage: (processing: boolean) => void;
}

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
}: NormLayoutProps) {
	// Function to render message content
	const renderMessageContent = (content: string): string => {
		if (!content) return "";
		const followUpMatch = content.match(/"followUp"\s*:\s*"([^"]*?)"/);
		if (followUpMatch?.[1]) {
			return followUpMatch[1].replace(/\\"/g, '"');
		}
		return content;
	};

	const handleNormMessageSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!message.trim() || !formId || processingMessage) return;

		setProcessingMessage(true);

		const userMessage: UIMessage = {
			id: Date.now(),
			role: "user",
			content: message,
		};

		setMessages((prev: UIMessage[]) => [...prev, userMessage]);
		setMessage("");

		try {
			const client = generateClient<Schema>();
			const messagePayload = JSON.stringify(messages.concat([userMessage]));

			const { data: normResponse } = await client.queries.Norm({
				conversationID: conversationId,
				messages: messagePayload,
				formID: formId,
				currentFormState: JSON.stringify(currentForm),
			});

			if (!normResponse) {
				throw new Error("Error calling Norm: No response received");
			}

			if (normResponse?.conversationID) {
				onConversationIdChange(normResponse.conversationID);
			}

			if (normResponse?.messages) {
				const formattedMessages = processMessages(normResponse.messages);
				if (formattedMessages.length > 0) {
					setMessages(formattedMessages);
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
				try {
					const updatedForm = JSON.parse(normResponse.currentFormState);
					if (updatedForm) {
						onFormUpdate(updatedForm);
					}
				} catch {
					// Simply log the error instead of attempting complex recovery
				}
			}
		} catch {
			setMessages((prev: UIMessage[]) => [
				...prev,
				{
					id: Date.now(),
					role: "assistant",
					content:
						"Sorry, I encountered an error processing your request. Please try again.",
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
	const processMessages = (messagesString: string): UIMessage[] => {
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
									msg.role === "user" ? "#505a5f" : "var(--hounslow-primary)",
								borderLeftWidth: msg.role === "assistant" ? "5px" : "0",
								borderRightWidth: msg.role === "user" ? "5px" : "0",
								borderStyle: "solid",
								borderTop: "none",
								borderBottom: "none",
							}}
						>
							<ReactMarkdown
								components={{
									p: ({ children, key }) => (
										<p
											key={key}
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
									ul: ({ children, key }) => (
										<ul key={key} className="govuk-list govuk-list--bullet">
											{children ?? ""}
										</ul>
									),
									li: ({ children, key }) => (
										<li key={key} className="govuk-body" style={{ margin: 0 }}>
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
		</>
	);
}
