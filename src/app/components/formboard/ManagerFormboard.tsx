
'use client'

import { useState, useEffect } from "react";
import Formboard from "@/app/components/formboard/Formboard";
import { getNewIndex } from "@/app/components/formboard/_helpers"
import { useIsMobileWindowSize } from "@/utils/responsivenessHelpers";
import { type Form } from "@/app/types/models";
import { FORM_STATUS } from "@/app/constants/models";
import { getFormsAssignedToUser, getUserIdByEmail } from "@/utils/apis"

const ManagerFormboard = () => {
    const [index, setIndex] = useState(0);   
    const [userId, setUserId] = useState(""); 
    const [assignedForms, setAssignedForms] = useState(Array<Form>);
    const [authorisedForms, setAuthorisedForms] = useState(Array<Form>); 

    useEffect(() => {
        const fetchUserId = async () => {
            setUserId(await getUserIdByEmail(""));
        }
        fetchUserId();
    }, [])

    useEffect(() => {
        const fetchAssignedForms = async (userId: string) => {
            const status = FORM_STATUS.SUBMITTED;
            setAssignedForms(await getFormsAssignedToUser(userId, status))
        }
        const fetchAuthorisedForms = async (userId: string) => {
            const status = FORM_STATUS.AUTHORISED;
            setAssignedForms(await getFormsAssignedToUser(userId, status))
        }
        fetchAssignedForms(userId);
        fetchAuthorisedForms(userId);
    }, [userId])

    const boardDetails = [
        { title: "Assigned", forms: assignedForms },
        { title: "Authorised", forms: authorisedForms },
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

export default ManagerFormboard;