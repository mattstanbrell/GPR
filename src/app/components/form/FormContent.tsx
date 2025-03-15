"use client";

import type React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import type { Schema } from "../../../../amplify/data/resource";
import { useRouter, useSearchParams } from "next/navigation";
import { generateClient } from "@aws-amplify/api";
import { FormLayout } from "./FormLayout";
import { NormLayout } from "./NormLayout";
import { FORM_BOARD } from "../../constants/urls";
import { createForm, updateForm, getFormById, getNormConversationByFormId, createBusiness } from "../../../utils/apis";
import { useUserModel } from "../../../utils/authenticationUtils";
import type { FormStatus } from "@/app/types/models";
import { isFormValid, processMessages } from "./_helpers";
import type { UIMessage, FormChanges } from "./types";
import { FormErrorSummary } from "./FormErrorSummary";

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
		section17: false,
		paymentMethod: "PREPAID_CARD", // Default payment method
		dateRequired: {
			day: null,
			month: null,
			year: null,
		},
		// Initialize recipient details (for prepaid cards)
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
		// Also initialize business details (for purchase orders)
		businessDetails: {
			name: "",
			address: {
				lineOne: "",
				lineTwo: "",
				townOrCity: "",
				postcode: "",
			},
		},
		// Use undefined instead of null for businessID to avoid DynamoDB GSI errors
		businessID: undefined,
	});
	const userModel = useUserModel();
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<UIMessage[]>([]);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [processingMessage, setProcessingMessage] = useState(false);
	const [formCreated, setFormCreated] = useState(false);
	const [updatedFields, setUpdatedFields] = useState<Set<string>>(new Set());
	const formCreationAttempted = useRef(false);

	// Get the form fields directly from the schema
	const formFields = {
		simple: ["title", "caseNumber", "reason", "amount", "section17", "paymentMethod", "businessID"] as const,
		nested: ["dateRequired", "recipientDetails", "businessDetails"] as const,
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
	const createFormSilently = useCallback(async () => {
		if (!userModel?.id || formCreated) {
			return;
		}

		try {
			const newForm = await createForm({
				...form,
				status: "DRAFT",
				creatorID: userModel.id,
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
				status: newForm.status as FormStatus,
			});
			setFormCreated(true);
		} catch (_error: unknown) {
			setErrorMessage(_error instanceof Error ? _error.message : String(_error));
		}
	}, [form, formCreated, router, userModel]);

	// Get the current user when the component mounts and check for existing form ID in URL
	useEffect(() => {
		async function initializeForm() {
			if (formCreationAttempted.current) {
				return;
			}
			formCreationAttempted.current = true;

			try {
				const formId = searchParams.get("id");

				if (formId) {
					await loadExistingForm(formId);
				} else if (userModel?.id) {
					await createFormSilently();
				}
			} catch (_error: unknown) {
				setErrorMessage(_error instanceof Error ? _error.message : String(_error));
			}
		}

		if (userModel) {
			initializeForm();
		}
	}, [searchParams, loadExistingForm, createFormSilently, userModel]);

	// Handle form field changes
	const handleFormChange = (field: string, value: unknown, updateDb = false) => {
		if (!form) return;

		setForm((prevForm: Partial<Schema["Form"]["type"]>) => {
			const newForm = { ...prevForm, [field]: value };
			if (updateDb && newForm.id) {
				updateFormInDatabase(newForm);
			}
			return newForm;
		});
	};

	// Update the form in the database
	const updateFormInDatabase = async (formToUpdate = form) => {
		if (!formToUpdate.id || !userModel?.id) return;

		try {
			// Create a clean version of the form data without null businessID
			const { businessID, ...restOfForm } = formToUpdate;

			// Only include businessID if it's not null
			const formDataToUpdate = {
				...restOfForm,
				creatorID: userModel.id,
				...(businessID !== null && { businessID }),
			};

			await updateForm(formToUpdate.id, formDataToUpdate);
		} catch (error) {
			console.error("Form update error:", error);
			setErrorMessage(`Failed to update form: ${error instanceof Error ? error.message : String(error)}`);
		}
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		console.log("handleSubmit called");
		e.preventDefault();

		if (!form || !form.id || !userModel?.id) return;

		try {
			setLoading(true);

			// Call the financeCode function with the UI messages and current form state
			const client = generateClient<Schema>();
			console.log("submission messages", messages);
			console.log("submission form", form);

			// Start finance code generation in parallel
			const financeCodePromise = client.queries.FinanceCodeFunction({
				messages: JSON.stringify(messages),
				currentFormState: JSON.stringify(form),
			});

			// Start business creation in parallel if needed
			let businessPromise: Promise<{ id: string } | null> = Promise.resolve(null);
			if (!form.businessID && form.paymentMethod === "PURCHASE_ORDER" && form.businessDetails?.name) {
				businessPromise = createBusiness(
					form.businessDetails.name,
					{
						lineOne: form.businessDetails.address?.lineOne || "",
						lineTwo: form.businessDetails.address?.lineTwo || undefined,
						townOrCity: form.businessDetails.address?.townOrCity || "",
						postcode: form.businessDetails.address?.postcode || "",
					},
					userModel.id,
				).catch((error) => {
					console.error("Error creating business:", error);
					// Return null if business creation fails
					return null;
				});
			}

			// Wait for both operations to complete in parallel
			const [financeCodeResult, newBusiness] = await Promise.all([financeCodePromise, businessPromise]);

			// Get the finance code response
			const financeCodeResponse = financeCodeResult.data;

			// Get the business ID (either existing or newly created)
			let businessID = form.businessID;
			if (newBusiness) {
				businessID = newBusiness.id;
				console.log("Created new business with ID:", businessID);
			}

			// Create a clean version of the form data without null businessID
			const { businessID: _, ...restOfForm } = form;

			// Only include businessID if it's not null
			const formDataToUpdate: Partial<Schema["Form"]["type"]> = {
				...restOfForm,
				status: "SUBMITTED" as FormStatus,
				creatorID: userModel.id,
				...(businessID && { businessID }),
				// Add the suggested finance code from the financeCode function
				...(financeCodeResponse && { suggestedFinanceCodeID: financeCodeResponse }),
			};

			await updateForm(form.id, formDataToUpdate);
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

								// Update the form in the database
								if (updatedForm.id) {
									updateFormInDatabase(updatedForm);
								}
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
