import React from "react";
import { useRouter } from "next/navigation";
import Table from "@/app/components/receipts/form/Table";
import { Submit } from "@/app/components/receipts/form/Buttons";

interface FormProps {
  receiptData: ReceiptData;
  handleAddItem: () => void;
  handleDeleteItem: (index: number) => void;
  slug: string;
}

const Form = ({ receiptData, handleAddItem, handleDeleteItem, slug }: FormProps) => {
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
      })),
    };

    console.log(data);
    router.push(`/form/${slug}/attachments`);
  };

  return (
    <form onSubmit={handleFormSubmission} className="pt-4 max-h-[70vh] overflow-scroll">
      <Table 
        receiptData={receiptData} 
        handleAddItem={handleAddItem} 
        handleDeleteItem={handleDeleteItem} 
      />
      <Submit style={`${!receiptHasItems ? "hidden" : "flex justify-center"}`} /> 
    </form>
  );
};

export default Form;
