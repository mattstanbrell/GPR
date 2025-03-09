
'use client'

import { useState, useEffect } from "react";
import Formboard from "@/app/components/formboard/Formboard";
import { getNewIndex } from "@/app/components/formboard/_helpers"
import { useIsMobileWindowSize } from "@/utils/responsivenessHelpers";
import { type Form } from "@/app/types/models";
import { getFormsCreatedByUser, getUserIdByEmail } from "@/utils/apis"
import { FORM_STATUS } from "@/app/constants/models";

const SocialWorkerFormboard = () => {
    const [index, setIndex] = useState(0);
    const [userId, setUserId] = useState(""); 
    const [draftForms, setDraftForms] = useState(Array<Form>);
    const [submittedForms, setSubmittedForms] = useState(Array<Form>);
    const [authorisedForms, setAuthorisedForms] = useState(Array<Form>);
    const [validatedForms, setValidatedForms] = useState(Array<Form>);

    useEffect(() => {
            const fetchUserId = async () => {
                setUserId(await getUserIdByEmail(""));
            }
            fetchUserId();
        }, [])
    

    useEffect(() => {
        const fetchDraftForms = async (userId: string) => {
            const status = FORM_STATUS.DRAFT;
            setDraftForms(await getFormsCreatedByUser(userId, status));
        }
        const fetchSubmittedForms = async (userId: string) => {
            const status = FORM_STATUS.SUBMITTED;
            setSubmittedForms(await getFormsCreatedByUser(userId, status));
        }
        const fetchAuthorisedForms = async (userId: string) => {
            const status = FORM_STATUS.AUTHORISED;
            setAuthorisedForms(await getFormsCreatedByUser(userId, status));
        }
        const fetchValidatedForms = async (userId: string) => {
            const status = FORM_STATUS.VALIDATED;
            setValidatedForms(await getFormsCreatedByUser(userId, status));
        }
        const userId = "12345";
        fetchDraftForms(userId);
        fetchSubmittedForms(userId);
        fetchAuthorisedForms(userId);
        fetchValidatedForms(userId); 
    }, [])

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