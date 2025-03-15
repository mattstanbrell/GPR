'use client'

import { useState } from "react";
import { AuthorisationButtonsContainer,
    SubmitFeedbackButtonContainer } from "@/app/components/form/feedback/ButtonsContainer";
import { FORM_STATUS, PERMISSIONS } from "@/app/constants/models";
import { Form } from "@/app/types/models";
import { useUserModel } from "@/utils/authenticationUtils";
import { SubmitSuccessStatusMessage, ApprovalStatusMessage, SubmitWarningMessage } from "@/app/components/form/feedback/Messages";
import { updateForm } from "@/utils/apis";

const FeedbackTextArea = (
    {feedback, isDisabled} : 
    {feedback: string, isDisabled: boolean}
) => {
    return <textarea 
            name="reject-feedback" 
            className="h-[10vh] w-full govuk-textarea" 
            defaultValue={ feedback } 
            placeholder="Reason for rejection." 
            required 
            disabled={ isDisabled } 
        />
}

const handleSubmitFeedback = async (form: Partial<Form>, event: React.FormEvent<HTMLFormElement>) => {
    console.log(event, form)
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    console.log(formData)
    await updateForm(form.id ? form.id : "", { 
        ...form, 
        feedback: formData.get("reject-feedback") as string,
        status: "DRAFT"
    });
}

const FeedbackContainer = ({form} : {form: Form}) => {
    const userModel = useUserModel();
    const isSocialWorker = userModel?.permissionGroup === PERMISSIONS.SOCIAL_WORKER_GROUP;
    
    const [isReject, setIsReject] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false); 

    return (
        <>
        { (isSocialWorker) ? (
            <>
                <ApprovalStatusMessage form={ form } />
            </>
        ) : (
            <>
                <AuthorisationButtonsContainer form={ form } 
                    isReject={ isReject } 
                    setIsReject={ setIsReject } 
                />
                { isReject &&
                    <form onSubmit={(event) => {
                        handleSubmitFeedback(form, event); 
                        setIsSubmitted(true); 
                    }} >
                        <div className="w-full govuk-form-group pr-[20px]">
                            <FeedbackTextArea feedback={ form.feedback ? `${form.feedback}` : "" } isDisabled={ false }/>
                            { !(isSubmitted) &&
                                <SubmitWarningMessage />
                            }
                            <SubmitFeedbackButtonContainer /> 
                        </div>
                    </form>
                }
                { isSubmitted && <SubmitSuccessStatusMessage /> }
            </>
        )}
        </>
    )
} 

export default FeedbackContainer;