
import React from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Table from "@/app/components/receipts/form/Table";

const Submit = () => {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className="hover:cursor-pointer">
            { !(pending) ? "Submit" : "Submitting" }
        </button>
    )
}

const Form = ({receiptData} : {receiptData: ReceiptData}) => {
    const router = useRouter();

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
        <form onSubmit={(event) => handleFormSubmission(event)}>
            <Table receiptData={ receiptData } />
            <Submit /> 
        </form>
    )
}

export default Form;