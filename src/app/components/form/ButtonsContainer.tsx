
'use client'

import { AuthoriseButton, FormAttachmentsButton, FormThreadsButton, 
    RejectButton, ValidateButton } from "@/app/components/form/Buttons"
import { FORM_STATUS } from "@/app/constants/models"
import type { Form } from "@/app/types/models"

export const ManagersFormButtonsContainer = (
    {form, isReject, setIsReject} : 
    {form: Form, isReject: boolean, setIsReject: (isReject: boolean) => void}
) => {

    const isValidated = form.status === FORM_STATUS.VALIDATED;
    const isAuthorised = form.status === FORM_STATUS.AUTHORISED;
    console.log(form.status)
    return (
        <>
        { form.status !== FORM_STATUS.DRAFT && 
        <div className="flex justify-left">
            <div className="govuk-button-group mt-4">
                <AuthoriseButton form={ form } isDisabled={ isAuthorised || isValidated } />
                <RejectButton isReject={ isReject } setIsReject={ setIsReject } isDisabled={ isAuthorised || isValidated } />
                <ValidateButton form={ form } isDisabled={ !(isAuthorised) || isValidated } />
            </div>
        </div>
        }
        </>
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
        <>
            { form.status != FORM_STATUS.DRAFT && 
                <div className="w-full flex justify-left">
                    <div className="govuk-button-group mt-4">
                        <FormThreadsButton form={ form } />
                        <FormAttachmentsButton form={ form } /> 
                    </div>
                </div>
            }
        </>
    )
}