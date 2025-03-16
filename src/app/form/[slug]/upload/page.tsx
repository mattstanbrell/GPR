"use client";
import { useState, use } from "react";
import Form from '@/app/components/receipts/form/Form';
import { useSearchParams } from "next/navigation";
import { ReceiptData } from '@/app/components/types/receipt';

const Title = ({ text }: { text: string }) => (
  <div className="h-[5vh] border-b-1 border-b-[#a9a9a9]">
    <h2 className="text-[var(--hounslow-primary)] text-xl md:text-2xl font-bold">{text}</h2>
  </div>
);

// Notice that params is now a promise. We use React's experimental use() hook to unwrap it.
const Upload = ({ params }: { params: Promise<{ slug: string }> }) => {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const searchParams = useSearchParams();
  const resultParam = searchParams.get("result");
  const uploadPathParam = searchParams.get("uploadPath");
  const fileNameParam = searchParams.get("fileName");

  let result = null;
  if (resultParam) {
    try {
      const parsedWrapper = JSON.parse(decodeURIComponent(resultParam));
      // If the response has a "data" field, parse its JSON string.
      result = parsedWrapper.data ? JSON.parse(parsedWrapper.data) : parsedWrapper;
    } catch (e) {
      console.error("Error parsing result:", e);
    }
  }

  const parsedResult = result
    ? {
        ...result,
        total: result.total
          ? parseFloat(String(result.total).replace(/[^0-9.-]+/g, ""))
          : 0,
      }
    : null;

  const [receiptData, setReceiptData] = useState(
    parsedResult || {
      total: 0.0,
      items: [],
      timeTaken: 0,
      cost: 0,
    }
  );

  const name = fileNameParam; 

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
      items: prevData.items.filter((_, i) => i !== index),
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
        slug={slug}
        uploadPath={uploadPathParam || ""}
        fileName={fileNameParam || ""}
      />
    </div>
  );
};

export default Upload;
