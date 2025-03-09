
'use client'

import { useState } from "react";
import Formboard from "@/app/components/formboard/Formboard";
import { getNewIndex, getUserAuthorisedForms, getUserAssignedForms} from "@/app/components/formboard/_helpers"
import { useIsMobileWindowSize } from "@/utils/responsivenessHelpers";

const ManagerFormboard = () => {
    const [index, setIndex] = useState(0);   
    const boardDetails = [
        { title: "Assigned", forms: getUserAssignedForms() },
        { title: "Authorised", forms: getUserAuthorisedForms() },
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