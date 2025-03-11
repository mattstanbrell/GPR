
'use client'

import React from "react"
import { useState, useEffect } from "react";
import Formboard from "@/app/components/formboard/Formboard";
import { getNewIndex } from "@/app/components/formboard/_helpers"
import { useIsMobileWindowSize } from "@/utils/responsivenessHelpers";
import { User, type Form } from "@/app/types/models";
import { FORM_STATUS } from "@/app/constants/models";
import { getFormsAssignedToUser } from "@/utils/apis"

const ManagerFormboard = ({userModel} : {userModel: User}) => {
    const userId = userModel.id
    const [assignedForms, setAssignedForms] = useState<Form[]>([]);
    const [authorisedForms, setAuthorisedForms] = useState<Form[]>([]); 
    const [index, setIndex] = useState<number>(0);

    useEffect(() => {
        const fetchAssignedForms = async (userId: string) => {
            const status = FORM_STATUS.SUBMITTED;
            setAssignedForms(await getFormsAssignedToUser(userId, status))
        }
        const fetchAuthorisedForms = async (userId: string) => {
            const status = FORM_STATUS.AUTHORISED;
            setAuthorisedForms(await getFormsAssignedToUser(userId, status))
        }
        fetchAssignedForms(userId);
        fetchAuthorisedForms(userId);
    }, [])
    
    const updateIndex = (isIncrement: boolean) => {
        const newIndex = getNewIndex(isIncrement, index, boards.length);
        setIndex(newIndex); 
    }

    const boardDetails = [
        { title: "Assigned", forms: assignedForms },
        { title: "Authorised", forms: authorisedForms },
    ];

    const boards = boardDetails.map(({title, forms}, index) => (
        <div key={ index } className='h-full md:w-1/4 xs:sm:w-full m-2'>
            <Formboard boardTitle={ title } boardForms={ forms } handleIndex={ updateIndex } />
        </div>
    ));
    
    return useIsMobileWindowSize() ? boards[index] : boards;
}

export default ManagerFormboard;