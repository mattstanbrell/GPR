'use client'

import React, { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useParams } from "next/navigation";

const getReceiptData = () => {
    return {
        "total": 6.83,
        "items": [
            { "name": "CKN BURGERS", "quantity": 1, "cost": 0.97 },
            { "name": "SARDINES", "quantity": 1, "cost": 0.34 },
            { "name": "PORRIDGE OATS", "quantity": 1, "cost": 0.75 },
            { "name": "PEAR PACK", "quantity": 1, "cost": 0.49 },
            { "name": "TIN TOMATOES", "quantity": 1, "cost": 0.35 },
            { "name": "WHOLEMEAL", "quantity": 1, "cost": 0.45 },
            { "name": "S/BERRY JAM", "quantity": 1, "cost": 0.39 },
            { "name": "VEGETABLES", "quantity": 1, "cost": 0.49 },
            { "name": "PASSATA", "quantity": 1, "cost": 0.35 },
            { "name": "KIDNEY BEANS", "quantity": 1, "cost": 0.30 },
            { "name": "JACKET POTATO", "quantity": 1, "cost": 0.49 },
            { "name": "ONION", "quantity": 1, "cost": 0.59 },
            { "name": "MOZZARELLA", "quantity": 1, "cost": 0.47 },
            { "name": "SPAGHETTI", "quantity": 2, "cost": 0.40 }
        ]
    };
}

const Submit = () => {
    const { pending } = useFormStatus();
    return <button type="submit">{ !(pending) ? "Submit" : "Submitting" }</button>
}

const Upload = () => {
    const router = useRouter();
    const [receiptData, setReceiptData] = useState(getReceiptData());
    const attachmentId = useParams().id

    // retrieve from S3 bucket
    const name = "hotel_for_jim.jpg";

    // will need to become a server function for async/await
    const handleFormSubmission = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = {
            total: parseFloat(formData.get("total") as string) || 0,
            items: receiptData.items.map((_, index) => ({
                name: formData.get(`items[${index}].name`),
                quantity: parseInt(formData.get(`items[${index}.quantity]`) as string) || 0,
                cost: parseFloat(formData.get(`items[${index}.cost]`) as string) || 0,
            }))
        }

        console.log(data)
        const slug = 0;     // slug to be sent from attachments
        router.push(`/form/${slug}/attachments/${attachmentId}`)
    }

    return (
        <>
            <h2>{ name }</h2>
            <form onSubmit={(event) => handleFormSubmission(event)} >
                <div>
                    <label>Total £
                        <input name="total" type="number" defaultValue={ receiptData ? receiptData.total : 0.00 } />    
                    </label>
                </div>
                <div className="flex-3">
                    Item Name No. Cost £
                    {receiptData && receiptData.items && receiptData.items.map(({ name, quantity, cost}, index) => (
                        <div key={ index }>
                                <input name={`items[${index}].name`} type="text" defaultValue={ name ? name : "" } />
                                <input name={`items[${index}].quantity`} type="number" defaultValue={ quantity ? quantity : 0 } min="0" />
                                <input name={`items[${index}].cost`} type="number" defaultValue={ cost ? cost : 0.00 } min="0.00" step="0.01" />
                        </div>
                    ))}
                </div>
                <Submit />
            </form>
        </>
    )
}

export default Upload; 
