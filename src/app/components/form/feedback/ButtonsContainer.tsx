
'use client'

import { ApproveButton, RejectButton } from "@/app/components/form/feedback/Buttons"
import { Form } from "@/app/types/models"

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