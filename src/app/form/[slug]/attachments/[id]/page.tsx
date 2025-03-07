'use client'

import { useState } from "react";
import Form from '@/app/components/receipts/form/Form';

const getReceiptData = () => {
    return {
        "total": 3.06,
        "items": [
            { "name": "CKN BURGERS", "quantity": 1, "cost": 1.97 },
            { "name": "SARDINES", "quantity": 1, "cost": 0.34 },
            { "name": "PORRIDGE OATS", "quantity": 2, "cost": 0.75 }
        ]
    };
}

const Title = ({ text } : { text: string }) => {
    return <h2>{ text }</h2>
}

const Upload = () => {
    const [receiptData] = useState(getReceiptData());
    const name = "hotel_for_jim.jpg";   // retrieve image name from S3 bucket

    return (
        <>
            <Title text={ name } />
            <Form receiptData={ receiptData } />
        </>
    )
}

export default Upload; 
