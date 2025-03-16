import { FORM_STATUS } from "@/app/constants/models"
import type { Form } from "@/app/types/models"
import type { MessageStatus } from "@/app/types/feedback"

const MESSAGE_STATUS = {
    APPROVED: 1,
    REJECTED: 2,
    SUBMITTED: 3,
    AWAITING_APPROVAL: 4,
}

export const SubmitWarningMessage = () => {
    return (
        <div className="govuk-warning-text bg-[#ffff00] pl-2">
            <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
            <strong className="govuk-warning-text__text">
                <span className="govuk-visually-hidden">Warning</span>
                Once rejected, you will no longer have access to the form. 
            </strong>
        </div>
    )
}

const StatusMessage = ({heading, status, message} : {heading: string, status: MessageStatus, message?: string}) => {
    let bgColour;
    if (status === MESSAGE_STATUS.APPROVED) {
        bgColour = "bg-[#00703c]";
    } else if (status === MESSAGE_STATUS.REJECTED) {
        bgColour = "bg-[#d4351c]";
    } else {
        bgColour = "bg-[#1d70b8]";
    }

    return (
        <div className="w-full p-2 text-white">
            <div className={ `size-full p-2 rounded-[4px] ${bgColour}` }>
                <h2 className="ml-2 font-bold text-2xl">{ heading }</h2>
                { message && 
                    <div className="m-2 text-xl">
                        <h3 className="font-bold">Reason:</h3>
                        <p className="ml-4">{ message }</p>
                    </div>
                }
            </div>
        </div>
    )
}

export const SubmitSuccessStatusMessage = () => { 
    return <StatusMessage heading="Submitted" status={ MESSAGE_STATUS.SUBMITTED } /> 
}

const ApprovedStatusMessage = () => {
    return <StatusMessage heading="Approved" status={ MESSAGE_STATUS.APPROVED } /> 
}

const RejectedStatusMessage = ({feedback} : {feedback: string}) => {
    return <StatusMessage heading="Rejected" status={ MESSAGE_STATUS.REJECTED } message={ feedback } /> 
}

const AwaitingApprovalStatusMessage = () => {
    return <StatusMessage heading="Awaiting Approval" status={ MESSAGE_STATUS.AWAITING_APPROVAL } /> 
}

export const ApprovalStatusMessage = ({form} : {form: Form}) => {
    const isDraft = form.status === FORM_STATUS.DRAFT;
    const isAwaitingApproval = form.status === FORM_STATUS.SUBMITTED
    const isAuthorised = form.status === FORM_STATUS.AUTHORISED || form.status === FORM_STATUS.VALIDATED;

    if (isDraft && form.feedback) {
        return <RejectedStatusMessage feedback={form.feedback ? form.feedback : ""} /> 
    } else if (isAwaitingApproval) {
        return <AwaitingApprovalStatusMessage /> 
    } else if (isAuthorised) {
        return <ApprovedStatusMessage />
    }
}

