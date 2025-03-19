"use client";

import type React from "react";
import { useEffect, useState, useCallback, useRef, useContext } from "react";
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
	getNormConversationByFormId,
	createAuditLog,
	createBusiness,
	assignUserToFormWithThread,
	getAssigneesForForm

} from "../../../utils/apis";
import { FORM_STATUS, PERMISSIONS } from "@/app/constants/models";
import { AppContext } from "@/app/layout";

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
		businessDetails: {
			name: "",
			address: {
				lineOne: "",
				lineTwo: "",
				townOrCity: "",
				postcode: "",
			},
		},
		businessID: undefined,
		isRecurring: false,
	});
	const userModel = useUserModel();
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<UIMessage[]>([]);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [processingMessage, setProcessingMessage] = useState(false);
	const [formCreated, setFormCreated] = useState(false);
	const [updatedFields, setUpdatedFields] = useState<Set<string>>(new Set());
	const [mobileView, setMobileView] = useState<"norm" | "form">("norm"); // State for mobile toggle
	const formCreationAttempted = useRef(false);

	const { isMobile } = useContext(AppContext);

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
		nested: ["dateRequired", "recipientDetails", "businessDetails"] as const,
	};

	const updateFormInDatabase = useCallback(
		async (formToUpdate = form) => {
			if (!formToUpdate.id || !userModel?.id) return;

			try {
				const { businessID, ...restOfForm } = formToUpdate;
				const formDataToUpdate = {
					...restOfForm,
					creatorID: userModel.id,
					...(businessID !== null && { businessID }),
					isRecurring: formToUpdate.isRecurring ?? false,
					...(formToUpdate.recurrencePattern && {
						recurrencePattern: formToUpdate.recurrencePattern,
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

	const handleFormChange = useCallback(
		(field: string, value: unknown, updateDb = false) => {
			if (!form) return;

			setForm((prevForm: Partial<Schema["Form"]["type"]>) => {
				const newForm = { ...prevForm };

				// Skip read-only fields
				if (field === "createdAt" || field === "updatedAt" || field === "id") {
					return newForm;
				}

				// Handle nested field updates (e.g., recurrencePattern.frequency)
				if (field.includes(".")) {
					const [parentField, childField] = field.split(".") as [keyof Schema["Form"]["type"], string];

					// Skip if parent field is read-only
					if (parentField === "createdAt" || parentField === "updatedAt" || parentField === "id") {
						return newForm;
					}

					const parentValue = prevForm[parentField] ?? {};
					const updatedParentValue = {
						...(typeof parentValue === "object" ? parentValue : {}),
						[childField]: value,
					};

					// Safe assignment with type assertion
					(newForm as Record<string, unknown>)[parentField] = updatedParentValue;
				} else {
					// Safe assignment for top-level fields
					(newForm as Record<string, unknown>)[field] = value;

					if (field === "expenseType" && value === "PREPAID_CARD") {
						newForm.isRecurring = false;
						newForm.recurrencePattern = undefined;
					}
				}

				if (updateDb && newForm.id) {
					updateFormInDatabase(newForm);
				}
				return newForm;
			});
		},
		[form, updateFormInDatabase],
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!userModel) return;

		const team = await getTeamByID(userModel.teamID || "Placeholder");
		if (!form || !form.id || !userModel?.id || !form.amount) return;

		if (!team) {
			throw new Error("No team assigned.");
		}

		try {
			setLoading(true);

			const client = generateClient<Schema>();

			void client.queries
				.FinanceCodeFunction({
					messages: JSON.stringify(messages),
					currentFormState: JSON.stringify(form),
					formID: form.id,
				})
				.catch((error) => {
					console.error("Error in finance code generation:", error);
				});

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
					return null;
				});
			}

			const newBusiness = await businessPromise;

			let businessID = form.businessID;
			if (newBusiness) {
				businessID = newBusiness.id;
			}

			const { ...formDataToUpdate } = form;

			const formDataToSubmit: Partial<Schema["Form"]["type"]> = {
				...formDataToUpdate,
				status: "SUBMITTED" as FormStatus,
				creatorID: userModel.id,
				...(businessID && { businessID }),
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
			
			let formAssignee;
			try {
				const res = await getAssigneesForForm(form.id); 
				formAssignee = res;
			} catch (error) {
				formAssignee = null; 
			}
			
			if (!(formAssignee)) {
				await assignUserToFormWithThread(form.id, assigneeId);
			}
			
			await createAuditLog(`${userModel.firstName} ${userModel.lastName} submitted a form`, userModel.id, form.id);
			router.push(FORM_BOARD);
		} catch (_error: unknown) {
			setErrorMessage(_error instanceof Error ? _error.message : String(_error));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (updatedFields.size > 0) {
			const timer = setTimeout(() => {
				setUpdatedFields(new Set());
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [updatedFields]);

	const getFormChanges = (): FormChanges | null => {
		if (!lastNormForm || !form) return null;

		const changes: FormChanges = {};

		for (const field of formFields.simple) {
			if (lastNormForm[field] !== form[field]) {
				changes[field] = {
					from: lastNormForm[field],
					to: form[field],
				};
			}
		}

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
		<div
			style={{
				height: isMobile ? "calc(100vh - 110px)" : "calc(100vh - 140px)",
				overflow: "hidden",
			}}
		>
			<main className="govuk-main-wrapper" style={{ height: "100%", padding: "0" }}>
				<div
					className="govuk-width-container"
					style={{
						height: "100%",
						paddingLeft: isMobile ? "5px" : "15px",
						paddingRight: isMobile ? "5px" : "15px",
					}}
				>
					{isMobile ? (
						isSocialWorker && isDraft ? (
							<div style={{ height: "100%", width: "100%" }}>
								{mobileView === "norm" ? (
									<NormLayout
										messages={messages}
										message={message}
										setMessage={setMessage}
										setMessages={setMessages}
										formId={form.id}
										conversationId={conversationId}
										onConversationIdChange={setConversationId}
										onFormUpdate={(updatedForm) => {
											const changedFields = new Set<string>();
											if (!form) return;

											for (const field of formFields.simple) {
												if (form[field] !== updatedForm[field]) {
													changedFields.add(field);
												}
											}

											for (const field of formFields.nested) {
												if (JSON.stringify(form[field]) !== JSON.stringify(updatedForm[field])) {
													changedFields.add(field);
												}
											}

											setUpdatedFields(changedFields);
											setForm(updatedForm);
											setLastNormForm(updatedForm);

											if (updatedForm.id) {
												updateFormInDatabase(updatedForm);
											}
										}}
										currentForm={form}
										processingMessage={processingMessage}
										setProcessingMessage={setProcessingMessage}
										getFormChanges={getFormChanges}
										isMobile={true}
										onToggle={() => setMobileView("form")}
										isFormValid={isFormValid(form)}
									/>
								) : (
									<FormLayout
										form={form}
										loading={loading}
										handleFormChange={handleFormChange}
										handleSubmit={handleSubmit}
										isFormValid={isFormValid}
										disabled={processingMessage || !isDraft}
										updatedFields={updatedFields}
										isSocialWorker={isSocialWorker}
										isMobile={true}
										onToggle={() => setMobileView("norm")}
									/>
								)}
							</div>
						) : (
							<div style={{ height: "100%", width: "100%" }}>
								<FormLayout
									form={form}
									loading={loading}
									handleFormChange={handleFormChange}
									handleSubmit={handleSubmit}
									isFormValid={isFormValid}
									disabled={processingMessage || !isDraft}
									updatedFields={updatedFields}
									isSocialWorker={isSocialWorker}
									isMobile={true}
								/>
							</div>
						)
					) : (
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
									isMobile={false}
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
										onFormUpdate={(updatedForm) => {
											const changedFields = new Set<string>();
											if (!form) return;

											for (const field of formFields.simple) {
												if (form[field] !== updatedForm[field]) {
													changedFields.add(field);
												}
											}

											for (const field of formFields.nested) {
												if (JSON.stringify(form[field]) !== JSON.stringify(updatedForm[field])) {
													changedFields.add(field);
												}
											}

											setUpdatedFields(changedFields);
											setForm(updatedForm);
											setLastNormForm(updatedForm);

											if (updatedForm.id) {
												updateFormInDatabase(updatedForm);
											}
										}}
										currentForm={form}
										processingMessage={processingMessage}
										setProcessingMessage={setProcessingMessage}
										getFormChanges={getFormChanges}
										isMobile={false}
										isFormValid={isFormValid(form)}
									/>
								</div>
							)}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
