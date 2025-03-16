
'use client'

import { redirect } from "next/navigation"
import type { Form, FormStatus } from "@/app/types/models"
import { getThreadByFormId, updateForm } from "@/utils/apis"
import { FORM, FORM_BOARD, THREADS } from "@/app/constants/urls"
import { FORM_STATUS } from "@/app/constants/models"
import { useEffect, useState } from "react"

const handleUpdateForm = async (form: Partial<Form>, status: FormStatus) => {
    await updateForm(form.id ? form.id : "", { ...form, status: status });
    redirect(FORM_BOARD);
}

export const AuthoriseButton = ({form, isDisabled} : {form: Form, isDisabled: boolean}) => {
    return <button className={`govuk-button`} disabled={ isDisabled } onClick={() => handleUpdateForm(form, "AUTHORISED")}>Approve</button>
} 

export const RejectButton = (
    {isReject, setIsReject, isDisabled} : 
    {isReject: boolean, setIsReject: (isReject: boolean) => void, isDisabled: boolean}
) => {
    return <button className={`govuk-button govuk-button--warning`} disabled={ isDisabled } onClick={() => setIsReject(!isReject)}>{ !(isReject) ? "Reject" : "Cancel" }</button>
}

export const ValidateButton = ({form, isDisabled} : {form: Form, isDisabled: boolean}) => {
    return <button className={`govuk-button`} disabled={ isDisabled } onClick={() => handleUpdateForm(form, "VALIDATED")}>Validate</button>
} 

export const SubmitFeedbackButton = () => {
    return <button type="submit" className="govuk-button">Submit Feedback</button>
}

export const FormThreadsButton = ({form} : {form: Form}) => {
    const [threadsId, setThreadsId] = useState<string>(""); 

    useEffect(() => {
        const fetchThreadsId = async () => {
            const thread = await getThreadByFormId(form.id || "");
            setThreadsId(thread?.id || ""); 
        }
        fetchThreadsId();
    }, [form])
    
    const url = threadsId ? `${ THREADS }/${ threadsId }` : THREADS;
    const hasBeenAuthorised = form.status !== FORM_STATUS.SUBMITTED;

    return <button type="button" className="govuk-button" disabled={ hasBeenAuthorised } onClick={() => redirect(url)}>Contact Manager</button>
}

export const FormAttachmentsButton = ({form} : {form: Form}) => {
    const isFormNotApproved = form.status === FORM_STATUS.DRAFT || form.status === FORM_STATUS.SUBMITTED;
    const formName = form.title || form.reason || form.status;
    const url = `${ FORM }/${form.id}/attachments?formName=${formName}`;
    
    return <button type="button" className="govuk-button" disabled={ isFormNotApproved } onClick={() => redirect(url) }>Attach Receipt</button>
}