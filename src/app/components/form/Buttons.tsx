
'use client'

import { redirect } from "next/navigation"
import type { Form } from "@/app/types/models"
import { getThreadByFormId, updateForm } from "@/utils/apis"
import { FORM, FORM_BOARD, THREADS } from "@/app/constants/urls"
import { FORM_STATUS } from "@/app/constants/models"
import { useEffect, useState } from "react"
import { threads } from "../threads/dummy"

const handleApproveForm = async (form: Partial<Form>) => {
    await updateForm(form.id ? form.id : "", { ...form, status: "AUTHORISED" });
    redirect(FORM_BOARD);
}

export const ApproveButton = ({form} : {form: Form}) => {
    return <button className={`govuk-button`} onClick={() => handleApproveForm(form)}>Approve</button>
} 

export const RejectButton = (
    {isReject, setIsReject} : 
    {isReject: boolean, setIsReject: (isReject: boolean) => void}
) => {
    return <button className={`govuk-button govuk-button--warning`} onClick={() => setIsReject(!isReject)}>{ !(isReject) ? "Reject" : "Cancel" }</button>
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
    return <button type="button" className="govuk-button" onClick={() => redirect(url)}>Contact Manager</button>
}

export const FormAttachmentsButton = ({form} : {form: Form}) => {
    const isFormNotApproved = form.status === FORM_STATUS.DRAFT || form.status === FORM_STATUS.SUBMITTED;
    const formName = form.title || form.reason || form.status;
    const url = `${ FORM }/${form.id}/attachments?formName=${formName}`;
    
    return <button type="button" className="govuk-button" disabled={ isFormNotApproved } onClick={() => redirect(url) }>Attach Receipt</button>
}