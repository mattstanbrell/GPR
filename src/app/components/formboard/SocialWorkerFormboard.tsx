
'use client'

import { useState, useEffect } from 'react';
import Formboard from '@/app/components/formboard/Formboard';

const SocialWorkerFormboard = () => {

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

    const form3 = {
        id: 3,
        status: "validated",
        firstName: "John",
        lastName: "Doe",
        date: "15/02/25"
    };

    // to be changed to getter methods when DB is has been merged
    const draftForms: Array<object> = [];
    const submittedForms: Array<object> = [form1];
    const authorisedForms: Array<object> = [form2];
    const validatedForms: Array<object> = [form3];

    const boards = [
        <Formboard boardTitle="Draft" boardForms={ draftForms } index={ index } setIndex={ setIndex } size = { 4 } />,
        <Formboard boardTitle="Submitted" boardForms={ submittedForms } index={ index } setIndex={ setIndex } size = { 4 } />,
        <Formboard boardTitle="Authorised" boardForms={ authorisedForms } index={ index } setIndex={ setIndex } size = { 4 } />,
        <Formboard boardTitle="Validated" boardForms={ validatedForms } index={ index } setIndex={ setIndex } size = { 4 } />
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

export default SocialWorkerFormboard;