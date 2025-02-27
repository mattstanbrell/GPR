
'use client'

import { useState, useEffect } from 'react';
import Formboard from '@/app/components/formboard/Formboard';
import { updateIndexHelper, getUserAuthorisedForms, getUserAssignedForms} from '@/app/components/formboard/_helpers'

const ManagerFormboard = () => {

    const [isMobile, setIsMobile] = useState(false);
    const [index, setIndex] = useState(0); 
    const TOTAL_BOARDS = 2;

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
        { title: "Assigned", forms: getUserAssignedForms() },
        { title: "Authorised", forms: getUserAuthorisedForms() },
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

export default ManagerFormboard;