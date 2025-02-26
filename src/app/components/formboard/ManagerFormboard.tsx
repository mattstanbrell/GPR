
'use client'

import { useState, useEffect } from 'react';
import Formboard from '@/app/components/formboard/Formboard';

const ManagerFormboard = () => {

    const [isMobile, setIsMobile] = useState(false);
    const [index, setIndex] = useState(0); 

    useEffect(() => {
        const mediumWindowSize = 768;
        const handleResize = () => {
            setIsMobile(window.innerWidth < mediumWindowSize);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // retrieve the outstanding forms to show
    const form1 = {
        id: 1,
        status: "submitted",
        firstName: "Charlie",
        lastName: "Bucket",
        date: "25/02/25"
    };

    const form2 = {
        id: 2,
        status: "authorised",
        firstName: "Jill",
        lastName: "Doe",
        date: "21/02/25"
    };

    // to be changed to getter methods when DB is has been merged
    const assignedForms: Array<object> = [form1];
    const authorisedForms: Array<object> = [form2];

    const boards = [
        <Formboard boardTitle="Assigned" boardForms={ assignedForms } index={ index } setIndex={ setIndex } size = { 2 } />,
        <Formboard boardTitle="Authorised" boardForms={ authorisedForms } index={ index } setIndex={ setIndex } size = { 2 } />
    ]

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