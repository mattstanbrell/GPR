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
    return (
        <div className="h-[5vh] border-b-1 border-b-[#a9a9a9]">
            <h2 className="text-[var(--hounslow-primary)] text-xl md:text-2xl font-bold">{ text }</h2>
        </div>
    )
}

const Upload = () => {
    const [receiptData, setReceiptData] = useState(getReceiptData());
    const name = "hotel_for_jim.jpg";   // retrieve image name from S3 bucket

    const handleAddItem = () => {
        let newRow = { "name": "", "quantity": 0, "cost": 0.00 }
        setReceiptData((prevData) => ({
            ...prevData,
            items: [...prevData.items, newRow]
        }));
    }

    const handleDeleteItem = (index: number) => {
        setReceiptData((prevData) => ({
            ...prevData,
            items: prevData.items.filter((_, i) => i !== index) // Remove item at the given index
        }));
    }

    return (
        <div className="overflow-scroll">
            <Title text={ name } />
            <Form 
                receiptData={ receiptData } 
                handleAddItem={ handleAddItem } 
                handleDeleteItem={ handleDeleteItem } 
            />
        </div>
    )
}

export default Upload; 
