"use client";

import type React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../../../../amplify/data/resource";
import { useRouter, useSearchParams } from "next/navigation";
import { FORM_BOARD } from "../../constants/urls";
import { isFormValid, processMessages } from "./_helpers";
import type { UIMessage, FormChanges } from "./types";
import { FormErrorSummary } from "./FormErrorSummary";
import { FormLayout } from "./FormLayout";
import { NormLayout } from "./NormLayout";
import { createForm, updateForm, getFormById, getNormConversationByFormId } from "../../../utils/apis";

export function FormContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [lastNormForm, setLastNormForm] = useState<Partial<Schema["Form"]["type"]> | null>(null);
	const [form, setForm] = useState<Partial<Schema["Form"]["type"]>>({
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
	const [updatedFields, setUpdatedFields] = useState<Set<string>>(new Set());
	const formCreationAttempted = useRef(false);

	// Get the form fields directly from the schema
	const formFields = {
		simple: ["title", "caseNumber", "reason", "amount"] as const,
		nested: ["dateRequired", "recipientDetails"] as const,
	};

	const loadConversation = useCallback(
		async (formId: string) => {
			try {
				const conversation = await getNormConversationByFormId(formId);

				if (conversation) {
					setConversationId(conversation.id);
					if (conversation.messages) {
						const processedMessages = processMessages(conversation.messages);
						setMessages(processedMessages);
					}
				}
			} catch {
				if (conversationId) {
					setErrorMessage(
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
				const existingForm = await getFormById(formId);

				if (!existingForm) {
					return;
				}

				setForm(existingForm as Partial<Schema["Form"]["type"]>);
				setFormCreated(true);
				await loadConversation(formId);
			} catch (_error: unknown) {
				setErrorMessage(_error instanceof Error ? _error.message : String(_error));
			}
		},
		[loadConversation],
	);

	// Create the form silently in the background
	// Only happens once
	const createFormSilently = useCallback(
		async (userIdParam?: string) => {
			const effectiveUserId = userIdParam || userId;
			if (!effectiveUserId || formCreated) {
				return;
			}

			try {
				const newForm = await createForm({
					...form,
					status: "DRAFT",
					creatorID: effectiveUserId,
				});

				if (!newForm) {
					throw new Error("Failed to create form: No form data returned");
				}

				// First update the URL, then update the form state
				const newUrl = `/form?id=${newForm.id}`;
				await router.replace(newUrl);

				setForm({
					...form,
					id: newForm.id,
					status: newForm.status as "DRAFT" | "SUBMITTED" | "AUTHORISED" | "VALIDATED" | "COMPLETED",
				});
				setFormCreated(true);
			} catch (_error: unknown) {
				setErrorMessage(_error instanceof Error ? _error.message : String(_error));
			}
		},
		[form, formCreated, router, userId],
	);

	// Get the current user when the component mounts and check for existing form ID in URL
	useEffect(() => {
		async function getUserIdAndInitializeForm() {
			if (formCreationAttempted.current) {
				return;
			}
			formCreationAttempted.current = true;

			try {
				const user = await getCurrentUser();
				setUserId(user.userId);

				const formId = searchParams.get("id");

				if (formId) {
					await loadExistingForm(formId);
				} else {
					await createFormSilently(user.userId);
				}
			} catch (_error: unknown) {
				setErrorMessage(_error instanceof Error ? _error.message : String(_error));
			}
		}

		getUserIdAndInitializeForm();
	}, [searchParams, loadExistingForm, createFormSilently]);

	// Handle form field changes
	const handleFormChange = (field: string, value: unknown, updateDb = false) => {
		if (!form) return;

		setForm((prevForm) => {
			const newForm = { ...prevForm, [field]: value };
			if (updateDb && newForm.id) {
				updateFormInDatabase(newForm);
			}
			return newForm;
		});
	};

	// Update the form in the database
	const updateFormInDatabase = async (formToUpdate = form) => {
		if (!formToUpdate.id || !userId) return;

		try {
			await updateForm(formToUpdate.id, {
				...formToUpdate,
				creatorID: userId,
			});
		} catch {
			setErrorMessage("Failed to update form. Please try again.");
		}
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!form || !form.id) return;

		try {
			setLoading(true);
			await updateForm(form.id, { status: "SUBMITTED" });
			router.push(FORM_BOARD);
		} catch (_error: unknown) {
			setErrorMessage(_error instanceof Error ? _error.message : String(_error));
		} finally {
			setLoading(false);
		}
	};

	// Clear updated fields after animation
	useEffect(() => {
		if (updatedFields.size > 0) {
			const timer = setTimeout(() => {
				setUpdatedFields(new Set());
			}, 1000); // Animation duration + a little extra
			return () => clearTimeout(timer);
		}
	}, [updatedFields]);

	// Add function to detect form changes
	const getFormChanges = (): FormChanges | null => {
		if (!lastNormForm || !form) return null;

		const changes: FormChanges = {};

		// Handle simple fields
		for (const field of formFields.simple) {
			if (lastNormForm[field] !== form[field]) {
				changes[field] = {
					from: lastNormForm[field],
					to: form[field],
				};
			}
		}

		// Handle nested fields
		for (const field of formFields.nested) {
			const lastValue = lastNormForm[field];
			const currentValue = form[field];

			if (JSON.stringify(lastValue) !== JSON.stringify(currentValue)) {
				changes[field] = { from: lastValue, to: currentValue };
			}
		}

		return Object.keys(changes).length > 0 ? changes : null;
	};

	if (errorMessage) {
		return <FormErrorSummary error={errorMessage} />;
	}

	return (
		<div style={{ height: "calc(100vh - 140px)", overflow: "hidden" }}>
			<main className="govuk-main-wrapper" style={{ height: "100%", padding: "0" }}>
				<div className="govuk-width-container" style={{ height: "100%", paddingLeft: "15px", paddingRight: "15px" }}>
					<div className="govuk-grid-row" style={{ height: "100%", margin: 0 }}>
						<FormLayout
							form={form}
							loading={loading}
							handleFormChange={handleFormChange}
							handleSubmit={handleSubmit}
							isFormValid={isFormValid}
							disabled={processingMessage}
							updatedFields={updatedFields}
						/>
						<NormLayout
							messages={messages}
							message={message}
							setMessage={setMessage}
							setMessages={setMessages}
							formId={form.id}
							conversationId={conversationId}
							onConversationIdChange={setConversationId}
							onFormUpdate={(updatedForm: Partial<Schema["Form"]["type"]>) => {
								// Find which fields changed
								const changedFields = new Set<string>();
								if (!form) return;

								// Check simple fields
								for (const field of formFields.simple) {
									if (form[field] !== updatedForm[field]) {
										changedFields.add(field);
									}
								}

								// Check nested fields
								for (const field of formFields.nested) {
									if (JSON.stringify(form[field]) !== JSON.stringify(updatedForm[field])) {
										changedFields.add(field);
									}
								}

								setUpdatedFields(changedFields);
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
