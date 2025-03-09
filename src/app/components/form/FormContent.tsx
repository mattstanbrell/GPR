"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../../../../amplify/data/resource";
import { useRouter, useSearchParams } from "next/navigation";
import { FORM_BOARD } from "../../constants/urls";
import { isFormValid, processMessages } from "./_helpers";
import type { FormData, UIMessage, FormChanges } from "./types";
import { FormErrorSummary } from "./FormErrorSummary";
import { FormLayout } from "./FormLayout";
import { NormLayout } from "./NormLayout";

export function FormContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastNormForm, setLastNormForm] = useState<FormData | null>(null);
	const [form, setForm] = useState<FormData>({
		status: "DRAFT",
		caseNumber: "",
		reason: "",
		amount: null,
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

	const loadConversation = useCallback(
		async (formId: string) => {
			try {
				const client = generateClient<Schema>();
				const { data: conversationData } =
					await client.models.NormConversation.list({
						filter: { formID: { eq: formId } },
						authMode: "userPool",
					});

				if (conversationData && conversationData.length > 0) {
					const conversation = conversationData[0];
					setConversationId(conversation.id);
					if (conversation.messages) {
						const processedMessages = processMessages(conversation.messages);
						setMessages(processedMessages);
					}
				}
			} catch (error) {
				console.error("Failed to load conversation:", error);
				if (conversationId) {
					setError(
						"Failed to load chat history. You can continue filling the form, but the chat may be incomplete.",
					);
				}
			}
		},
		[conversationId],
	);

	const loadExistingForm = useCallback(
		async (formId: string) => {
			try {
				const client = generateClient<Schema>();
				const { data: existingForm } = await client.models.Form.get(
					{ id: formId },
					{ authMode: "userPool" },
				);

				if (!existingForm) {
					return;
				}

				setForm(existingForm as FormData);
				setFormCreated(true);
				await loadConversation(formId);
			} catch (error) {
				setError(error instanceof Error ? error.message : String(error));
			}
		},
		[loadConversation],
	);

	// Create the form silently in the background
	// Only happens once
	const createFormSilently = useCallback(
		async (userIdParam?: string) => {
			const effectiveUserId = userIdParam || userId;
			if (!effectiveUserId || formCreated) return;

			try {
				const client = generateClient<Schema>();
				const { data: newForm } = await client.models.Form.create(
					{
						...form,
						status: "DRAFT",
						creatorID: effectiveUserId,
					},
					{ authMode: "userPool" },
				);

				if (!newForm) {
					throw new Error("Failed to create form: No form data returned");
				}

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

				const newUrl = `/form?id=${newForm.id}`;
				router.replace(newUrl);
			} catch (error) {
				setError(error instanceof Error ? error.message : String(error));
			}
		},
		[form, formCreated, router, userId],
	);

	// Get the current user when the component mounts and check for existing form ID in URL
	useEffect(() => {
		async function getUserIdAndInitializeForm() {
			try {
				const user = await getCurrentUser();
				setUserId(user.userId);

				const formId = searchParams.get("id");
				if (formId) {
					await loadExistingForm(formId);
				} else {
					await createFormSilently(user.userId);
				}
			} catch (error) {
				setError(error instanceof Error ? error.message : String(error));
			}
		}

		getUserIdAndInitializeForm();
	}, [searchParams, loadExistingForm, createFormSilently]);

	// Handle form field changes
	const handleFormChange = (
		field: string,
		value: unknown,
		updateDb = false,
	) => {
		if (!form) return;

		console.log("🔄 handleFormChange called:", {
			field,
			value,
			updateDb,
			currentAmount: form.amount,
		});

		setForm((prevForm) => {
			const newForm = { ...prevForm, [field]: value };
			console.log("✏️ New form state:", {
				amount: newForm.amount,
				field,
				value,
			});
			if (updateDb && newForm.id) {
				updateFormInDatabase(newForm);
			}
			return newForm;
		});
	};

	// Update the form in the database
	const updateFormInDatabase = async (formToUpdate = form) => {
		if (!formToUpdate.id) return;

		try {
			const client = generateClient<Schema>();
			const updateData = {
				...formToUpdate,
				id: formToUpdate.id,
			};
			console.log(
				"💾 Updating database with:",
				JSON.stringify(updateData, null, 2),
			);
			const result = await client.models.Form.update(updateData, {
				authMode: "userPool",
			});
			console.log(
				"✅ Database update result:",
				JSON.stringify(result, null, 2),
			);
		} catch (error) {
			console.error("❌ Database update error:", error);
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

			router.push(FORM_BOARD);
		} catch (error) {
			setError(error instanceof Error ? error.message : String(error));
		} finally {
			setLoading(false);
		}
	};

	// Add function to detect form changes
	const getFormChanges = (): FormChanges | null => {
		if (!lastNormForm || !form) return null;

		const changes: FormChanges = {};

		// Check top-level fields
		if (lastNormForm.caseNumber !== form.caseNumber) {
			changes.caseNumber = {
				from: lastNormForm.caseNumber,
				to: form.caseNumber,
			};
		}
		if (lastNormForm.reason !== form.reason) {
			changes.reason = { from: lastNormForm.reason, to: form.reason };
		}
		if (lastNormForm.amount !== form.amount) {
			changes.amount = { from: lastNormForm.amount, to: form.amount };
		}

		// Check date required
		if (
			JSON.stringify(lastNormForm.dateRequired) !==
			JSON.stringify(form.dateRequired)
		) {
			changes.dateRequired = {
				from: lastNormForm.dateRequired,
				to: form.dateRequired,
			};
		}

		// Check recipient details
		const lastRecipient = lastNormForm.recipientDetails || {};
		const currentRecipient = form.recipientDetails || {};

		// Check name
		if (
			JSON.stringify(lastRecipient.name) !==
			JSON.stringify(currentRecipient.name)
		) {
			changes.recipientName = {
				from: lastRecipient.name,
				to: currentRecipient.name,
			};
		}

		// Check address
		if (
			JSON.stringify(lastRecipient.address) !==
			JSON.stringify(currentRecipient.address)
		) {
			changes.recipientAddress = {
				from: lastRecipient.address,
				to: currentRecipient.address,
			};
		}

		return Object.keys(changes).length > 0 ? changes : null;
	};

	if (error) {
		return <FormErrorSummary error={error} />;
	}

	return (
		<div style={{ height: "calc(100vh - 140px)", overflow: "hidden" }}>
			<main
				className="govuk-main-wrapper"
				style={{ height: "100%", padding: "0" }}
			>
				<div
					className="govuk-width-container"
					style={{ height: "100%", paddingLeft: "15px", paddingRight: "15px" }}
				>
					<div className="govuk-grid-row" style={{ height: "100%", margin: 0 }}>
						<FormLayout
							form={form}
							loading={loading}
							handleFormChange={handleFormChange}
							handleSubmit={handleSubmit}
							isFormValid={isFormValid}
							disabled={processingMessage}
						/>
						<NormLayout
							messages={messages}
							message={message}
							setMessage={setMessage}
							setMessages={setMessages}
							formId={form.id}
							conversationId={conversationId}
							onConversationIdChange={setConversationId}
							onFormUpdate={(updatedForm: FormData) => {
								setForm(updatedForm);
								setLastNormForm(updatedForm);
							}}
							currentForm={form}
							processingMessage={processingMessage}
							setProcessingMessage={setProcessingMessage}
							getFormChanges={getFormChanges}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}
