'use client';

import { useState } from "react";
import Form from '@/app/components/receipts/form/Form';
import { useSearchParams } from "next/navigation";


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
  let result: any = null;
  if (resultParam) {
    try {
      const parsedWrapper = JSON.parse(decodeURIComponent(resultParam));
      // If the response has a "data" field, parse its JSON string.
      result = parsedWrapper.data ? JSON.parse(parsedWrapper.data) : parsedWrapper;
    } catch (e) {
      console.error("Error parsing result:", e);
    }
  }

  // Convert total from string to number
  const parsedResult = result
  ? {
      ...result,
      total: result.total
        ? parseFloat(String(result.total).replace(/[^0-9.-]+/g, ""))
        : 0,
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
    setReceiptData((prevData: ReceiptData) => ({
      ...prevData,
      items: [...prevData.items, newRow],
    }));
  };

  const handleDeleteItem = (index: number) => {
    setReceiptData((prevData: ReceiptData) => ({
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
