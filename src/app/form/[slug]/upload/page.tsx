'use client';

import { useState } from "react";
import Form from '@/app/components/receipts/form/Form';
import { useSearchParams } from "next/navigation";
import type { AnalysisResult } from "@/app/types/receipts";

const Title = ({ text }: { text: string }) => {
  return (
    <div className="h-[5vh] border-b-1 border-b-[#a9a9a9]">
      <h2 className="text-[var(--hounslow-primary)] text-xl md:text-2xl font-bold">{text}</h2>
    </div>
  );
};

const Upload = ({ params }: { params: { slug: string } }) => {
  const searchParams = useSearchParams();
  const resultParam = searchParams.get("result");

  // Parse the result from the query parameter
  const result: AnalysisResult | null = resultParam
    ? JSON.parse(decodeURIComponent(resultParam))
    : null;

  // Convert total from string to number
  const parsedResult = result
    ? {
        ...result,
        total: parseFloat(result.total.replace(/[^0-9.-]+/g, "")), // Convert total to number
      }
    : null;

  // Use the parsed result or fallback to default data
  const [receiptData, setReceiptData] = useState(
    parsedResult || {
      total: 0.0, // Default total is now a number
      items: [],
      timeTaken: 0,
      cost: 0,
    }
  );

  const name = "hotel_for_jim.jpg"; 

  const handleAddItem = () => {
    const newRow = { name: "", quantity: 0, cost: 0.0 };
    setReceiptData((prevData) => ({
      ...prevData,
      items: [...prevData.items, newRow],
    }));
  };

  const handleDeleteItem = (index: number) => {
    setReceiptData((prevData) => ({
      ...prevData,
      items: prevData.items.filter((_, i) => i !== index), // Remove item at the given index
    }));
  };

  if (!parsedResult) {
    return <div>No receipt data found.</div>;
  }

  return (
    <div className="overflow-scroll">
      <Title text={name} />
      <Form
        receiptData={receiptData}
        handleAddItem={handleAddItem}
        handleDeleteItem={handleDeleteItem}
      />
    </div>
  );
};

export default Upload;
