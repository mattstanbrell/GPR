
'use client'

import { useState, useEffect } from "react";
import Formboard from "@/app/components/formboard/Formboard";
import { getNewIndex } from "@/app/components/formboard/_helpers"
import { useIsMobileWindowSize } from "@/utils/responsivenessHelpers";
import type { User, Form } from "@/app/types/models";
import { getFormsCreatedByUser } from "@/utils/apis"
import { FORM_STATUS } from "@/app/constants/models";

const SocialWorkerFormboard = ({userModel} : {userModel: User}) => {
    const userId = userModel.id; 
    const [draftForms, setDraftForms] = useState<Form[]>([]);
    const [submittedForms, setSubmittedForms] = useState<Form[]>([]);
    const [authorisedForms, setAuthorisedForms] = useState<Form[]>([]);
    const [validatedForms, setValidatedForms] = useState<Form[]>([]);
    const [index, setIndex] = useState<number>(0);    

    useEffect(() => {
        const fetchDraftForms = async () => {
            setDraftForms(await getFormsCreatedByUser(userId, FORM_STATUS.DRAFT));
        }
        const fetchSubmittedForms = async () => {
            setSubmittedForms(await getFormsCreatedByUser(userId, FORM_STATUS.SUBMITTED));
        }
        const fetchAuthorisedForms = async () => {
            setAuthorisedForms(await getFormsCreatedByUser(userId, FORM_STATUS.AUTHORISED));
        }
        const fetchValidatedForms = async () => {
            setValidatedForms(await getFormsCreatedByUser(userId, FORM_STATUS.VALIDATED));
        }
        fetchDraftForms();
        fetchSubmittedForms();
        fetchAuthorisedForms();
        fetchValidatedForms(); 
    }, [userId])

    const boardDetails = [
        { title: "Draft", forms: draftForms },
        { title: "Submitted", forms: submittedForms },
        { title: "Authorised", forms: authorisedForms },
        { title: "Validated", forms: validatedForms }
    ];

    const updateIndex = (isIncrement: boolean) => {
        const newIndex = getNewIndex(isIncrement, index, boardDetails.length);
        setIndex(newIndex); 
    }

    const boards = boardDetails.map(({title, forms}, index) => (
        <div key={ index } className='h-full md:w-1/4 xs:sm:w-full m-2'>
            <Formboard boardTitle={ title } boardForms={ forms } handleIndex={ updateIndex } />
        </div>
    ));

    return useIsMobileWindowSize() ? boards[index] : boards;
}

export default SocialWorkerFormboard;