
'use client'

import { useState, useEffect } from 'react';
import Formboard from '@/app/components/formboard/Formboard';
import { updateIndexHelper, getUserDraftForms, getUserSubmittedForms, getUserAuthorisedForms, getUserValidatedForms} from '@/app/components/formboard/_helpers'

const SocialWorkerFormboard = () => {

    const [isMobile, setIsMobile] = useState(false);
    const [index, setIndex] = useState(0); 
    const TOTAL_BOARDS = 4;

    useEffect(() => {
        const mediumWindowSize = 768;
        const handleResize = () => {
            setIsMobile(window.innerWidth < mediumWindowSize);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const updateIndex = ({isIncrement} : {isIncrement: boolean}) => {
        updateIndexHelper({ isIncrement, index, setIndex, TOTAL_BOARDS }); 
    }

    const boardDetails = [
        { title: "Draft", forms: getUserDraftForms() },
        { title: "Submitted", forms: getUserSubmittedForms() },
        { title: "Authorised", forms: getUserAuthorisedForms() },
        { title: "Validated", forms: getUserValidatedForms() }
    ];

    const boards = boardDetails.map(({title, forms}) => (
        <Formboard boardTitle={ title } boardForms={ forms } handleIndex={ updateIndex } />
    ));

    return (
        <div key={ index } className="w-full md:flex overflow-clip">
            {
                isMobile ? (
                    boards[index]
                ) : (
                    boards
                )
            }
        </div>
    )
}

export default SocialWorkerFormboard;