'use client'

import React, { useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

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
    const router = useRouter();
    const [receiptData, setReceiptData] = useState(getReceiptData());
    const { pending } = useFormStatus();

    // retrieve from S3 bucket
    const name = "hotel_for_jim.jpg";

    // will need to become a server function for async/await
    const handleFormSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = {
            total: parseFloat(formData.get("total") as string) || 0,
            items: receiptData.items.map((_, index) => ({
                name: formData.get(`items[${index}].name`),
                quantity: parseInt(formData.get(`items[${index}].quantity`) as string) || 0,
                cost: parseFloat(formData.get(`items[${index}].cost`) as string) || 0,
            }))
        }

        console.log(data)
        const slug = 0;     // slug to be sent from attachments
        router.push(`/form/${slug}/attachments`)
    }

    return (
        <>
            <Title text={ name } />
            <form onSubmit={(event) => handleFormSubmission(event)}>
                <table>
                    <tbody>
                        <tr>
                            <td colSpan={2} className="text-right">
                                Total £
                            </td>
                            <td><input name="total" type="number" defaultValue={ receiptData ? receiptData.total : 0.00 } />   </td>
                        </tr>
                        <tr>
                            <td>Item Name</td>
                            <td>No.</td>
                            <td>Cost £</td>
                        </tr>
                        {receiptData && receiptData.items && receiptData.items.map(({ name, quantity, cost}, index) => (
                            <tr key={ index }>
                                    <td><input name={`items[${index}].name`} type="text" defaultValue={ name ? name : "" } /></td>
                                    <td><input name={`items[${index}].quantity`} type="number" defaultValue={ quantity ? quantity : 0 } min="0" /></td>
                                    <td><input name={`items[${index}].cost`} type="number" defaultValue={ cost ? cost : 0.00 } min="0.00" step="0.01" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="submit" className="hover:cursor-pointer">
                    { !(pending) ? "Submit" : "Submitting" }
                </button>
            </form>
        </>
    )
}

export default Upload; 
