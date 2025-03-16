
'use client'

import { redirect } from "next/navigation"
import { Form } from "@/app/types/models"
import { updateForm } from "@/utils/apis"
import { FORM_BOARD } from "@/app/constants/urls"

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