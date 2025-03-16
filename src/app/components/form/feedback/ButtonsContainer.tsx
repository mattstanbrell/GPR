
'use client'

import { ApproveButton, FormAttachmentsButton, FormThreadsButton, RejectButton } from "@/app/components/form/feedback/Buttons"
import type { Form } from "@/app/types/models"

export const AuthorisationButtonsContainer = (
    {form, isReject, setIsReject} : 
    {form: Form, isReject: boolean, setIsReject: (isReject: boolean) => void}
) => {
    return (
        <div className="flex justify-center">
            <div className="md:flex md:justify-evenly w-1/2 mt-2">
                <ApproveButton form={ form } />
                <RejectButton isReject={ isReject } setIsReject={ setIsReject } />
            </div>
        </div>
    )
}

export const SubmitFeedbackButtonContainer = () => {
    return (
        <div className="flex justify-center">
            <div className="flex justify-evenly w-1/2">
                <button type="submit" className="govuk-button">Submit Feedback</button>
            </div>
        </div>
    )
}

export const SocialWorkerFormButtonContainer = ({form} : {form: Form}) => {
    return (
        <div className="w-full flex justify-left">
            <div className="govuk-button-group mt-4">
                <FormThreadsButton form={ form } />
                <FormAttachmentsButton form={ form } /> 
            </div>
        </div>
    )
}