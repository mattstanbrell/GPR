
import React from "react";

import { useRouter } from "next/navigation";
import Table from "@/app/components/receipts/form/Table";
import { Submit } from "@/app/components/receipts/form/Buttons"

const Form = (
    {receiptData, handleAddItem, handleDeleteItem} : 
    {receiptData: ReceiptData, handleAddItem: () => void, handleDeleteItem: (index: number) => void}
) => {
    const router = useRouter();
    const receiptHasItems = receiptData && receiptData.items.length;

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
        <form onSubmit={(event) => handleFormSubmission(event)} className="pt-4 max-h-[70vh] overflow-scroll">
            <Table 
                receiptData={ receiptData } 
                handleAddItem={ handleAddItem } 
                handleDeleteItem={ handleDeleteItem } 
            />
            <Submit style={`${!(receiptHasItems) ? "hidden" : "flex justify-center"}` } /> 
        </form>
    )
}

export default Form;