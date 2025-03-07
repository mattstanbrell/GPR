
import React from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

interface ReceiptItem {
    name: string,
    quantity: number, 
    cost: number, 
}

interface ReceiptData {
    total: number,
    items: ReceiptItem[]
}

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
            <Submit /> 
        </form>
    )
}

export default Form;