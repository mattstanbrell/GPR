
'use client'

import { useState } from "react";
import Formboard from "@/app/components/formboard/Formboard";
import { updateIndexHelper, getUserDraftForms, getUserSubmittedForms, getUserAuthorisedForms, getUserValidatedForms} from "@/app/components/formboard/_helpers"
import { useIsMobileWindowSize } from "@/utils/responsivenessHelpers";

const SocialWorkerFormboard = () => {
    const [index, setIndex] = useState(0); 
    const boardDetails = [
        { title: "Draft", forms: getUserDraftForms() },
        { title: "Submitted", forms: getUserSubmittedForms() },
        { title: "Authorised", forms: getUserAuthorisedForms() },
        { title: "Validated", forms: getUserValidatedForms() }
    ];

    const updateIndex = (isIncrement: boolean) => {
        updateIndexHelper(isIncrement, index, setIndex, boardDetails.length); 
    }

    const boards = boardDetails.map(({title, forms}, index) => (
        <div key={ index } className='h-full md:w-1/4 xs:sm:w-full m-2'>
            <Formboard boardTitle={ title } boardForms={ forms } handleIndex={ updateIndex } />
        </div>
    ));

    return useIsMobileWindowSize() ? boards[index] : boards;
}

export default SocialWorkerFormboard;