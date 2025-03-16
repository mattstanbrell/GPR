"use client";

import type React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import type { Schema } from "../../../../amplify/data/resource";
import { useRouter, useSearchParams } from "next/navigation";
import { generateClient } from "@aws-amplify/api";
import { FormLayout } from "./FormLayout";
import { NormLayout } from "./NormLayout";
import { FORM_BOARD } from "../../constants/urls";
import { useUserModel } from "../../../utils/authenticationUtils";
import type { FormStatus } from "@/app/types/models";
import { isFormValid, processMessages } from "./_helpers";
import type { UIMessage, FormChanges } from "./types";
import { FormErrorSummary } from "./FormErrorSummary";
import {
	createForm,
	updateForm,
	getFormById,
	getTeamByID,
	assignUserToForm,
	getNormConversationByFormId,
	createBusiness,
} from "../../../utils/apis";
import { FORM_STATUS, PERMISSIONS } from "@/app/constants/models";

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
		expenseType: "PREPAID_CARD",
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
		// Initialize recurring payment fields
		isRecurring: false,
		recurrencePattern: {
			frequency: "MONTHLY",
			interval: 1,
			startDate: new Date().toISOString().split("T")[0],
			neverEnds: true,
			daysOfWeek: [],
			dayOfMonth: [1],
			months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		},
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
		simple: [
			"title",
			"caseNumber",
			"reason",
			"amount",
			"section17",
			"expenseType",
			"businessID",
			"isRecurring",
		] as const,
		nested: ["dateRequired", "recipientDetails", "businessDetails", "recurrencePattern"] as const,
	};

	// Update the form in the database
	const updateFormInDatabase = useCallback(
		async (formToUpdate = form) => {
			if (!formToUpdate.id || !userModel?.id) return;

			try {
				// Create a clean version of the form data without null businessID
				const { businessID, ...restOfForm } = formToUpdate;

				// Convert form data to update, ensuring all fields are included
				const formDataToUpdate = {
					...restOfForm,
					creatorID: userModel.id,
					...(businessID !== null && { businessID }),
					// Ensure recurring fields are included
					isRecurring: formToUpdate.isRecurring ?? false,
					...(formToUpdate.recurrencePattern && {
						recurrencePattern: {
							frequency: formToUpdate.recurrencePattern.frequency || "MONTHLY",
							interval: formToUpdate.recurrencePattern.interval || 1,
							startDate: formToUpdate.recurrencePattern.startDate || "",
							endDate: formToUpdate.recurrencePattern.endDate,
							maxOccurrences: formToUpdate.recurrencePattern.maxOccurrences,
							neverEnds: formToUpdate.recurrencePattern.neverEnds ?? false,
							daysOfWeek: formToUpdate.recurrencePattern.daysOfWeek || [],
							dayOfMonth: formToUpdate.recurrencePattern.dayOfMonth || [],
							monthEnd: formToUpdate.recurrencePattern.monthEnd ?? false,
							monthPosition: formToUpdate.recurrencePattern.monthPosition,
							months: formToUpdate.recurrencePattern.months || [],
							excludedDates: formToUpdate.recurrencePattern.excludedDates || [],
							description: formToUpdate.recurrencePattern.description || "",
						},
					}),
				};

				await updateForm(formToUpdate.id, formDataToUpdate);
			} catch (error) {
				console.error("Form update error:", error);
				setErrorMessage(`Failed to update form: ${error instanceof Error ? error.message : String(error)}`);
			}
		},
		[form, userModel?.id],
	);

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
	const handleFormChange = useCallback(
		(field: string, value: unknown, updateDb = false) => {
			if (!form) return;

			// Handle nested properties in recurrencePattern
			if (field.includes("recurrencePattern.")) {
				const nestedField = field.split("recurrencePattern.")[1];

				setForm((prevForm) => {
					const updatedPattern = {
						...(prevForm.recurrencePattern || {}),
						[nestedField]: value,
					};

					return {
						...prevForm,
						recurrencePattern: updatedPattern,
					};
				});

				if (updateDb && form.id) {
					// Update the database with the new form data
					updateFormInDatabase({
						id: form.id,
						recurrencePattern: {
							...(form.recurrencePattern || {}),
							[field.split("recurrencePattern.")[1]]: value,
						},
					});
				}

				return;
			}

			setForm((prevForm: Partial<Schema["Form"]["type"]>) => {
				let newForm = { ...prevForm, [field]: value };

				// Reset recurring payment fields when switching to prepaid card
				if (field === "expenseType" && value === "PREPAID_CARD") {
					newForm = {
						...newForm,
						isRecurring: false,
						recurrencePattern: undefined,
					};
				}

				if (updateDb && newForm.id) {
					updateFormInDatabase(newForm);
				}
				return newForm;
			});
		},
		[form, updateFormInDatabase],
	);

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		console.log("handleSubmit called");
		e.preventDefault();

		if (!userModel) return;

		const team = await getTeamByID(userModel.teamID || "");
		if (!form || !form.id || !userModel?.id || !form.amount || !team) return;

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
			if (!form.businessID && form.expenseType === "PURCHASE_ORDER" && form.businessDetails?.name) {
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
			const { ...formDataToUpdate } = form;

			// Only include businessID if it's not null
			const formDataToSubmit: Partial<Schema["Form"]["type"]> = {
				...formDataToUpdate,
				status: "SUBMITTED" as FormStatus,
				creatorID: userModel.id,
				...(businessID && { businessID }),
				// Add the suggested finance code from the financeCode function
				...(financeCodeResponse && { suggestedFinanceCodeID: financeCodeResponse }),
			};

			await updateForm(form.id, formDataToSubmit);

			let assigneeId: string;
			if (form.amount > 5000) {
				if (!team?.managerUserID) return;
				assigneeId = team.managerUserID;
			} else {
				if (!team?.assistantManagerUserID) return;
				assigneeId = team.assistantManagerUserID;
			}
			await assignUserToForm(form.id, assigneeId);

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

	const isSocialWorker = userModel?.permissionGroup === PERMISSIONS.SOCIAL_WORKER_GROUP;
	const isDraft = form.status === FORM_STATUS.DRAFT;

	return (
		<div style={{ height: "calc(100vh - 140px)", overflow: "hidden" }}>
			<main className="govuk-main-wrapper" style={{ height: "100%", padding: "0" }}>
				<div className="govuk-width-container" style={{ height: "100%", paddingLeft: "15px", paddingRight: "15px" }}>
					<div className="govuk-grid-row flex" style={{ height: "100%", margin: 0 }}>
						<div className={`${isSocialWorker && isDraft ? "md:w-6/10" : "md:w-full"}`}>
							<FormLayout
								form={form}
								loading={loading}
								handleFormChange={handleFormChange}
								handleSubmit={handleSubmit}
								isFormValid={isFormValid}
								disabled={processingMessage || !isDraft}
								updatedFields={updatedFields}
								isSocialWorker={isSocialWorker}
							/>
						</div>
						{isDraft && isSocialWorker && (
							<div className="md:w-4/10">
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
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
