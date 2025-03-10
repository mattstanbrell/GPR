// 'use client'

// import { useState } from "react";
// import Form from '@/app/components/receipts/form/Form';
// import { useSearchParams } from "next/navigation";

// type Item = {
//   name: string;
//   quantity: number;
//   cost: number;
// };

// type AnalysisResult = {
//   total: string;
//   items: Item[];
//   timeTaken: number;
//   cost: number;
//   tokenInfo?: {
//     inputTokens: number;
//     outputTokens: number;
//   };
// };

// const getReceiptData = () => {
//     return {
//         "total": 3.06,
//         "items": [
//             { "name": "CKN BURGERS", "quantity": 1, "cost": 1.97 },
//             { "name": "SARDINES", "quantity": 1, "cost": 0.34 },
//             { "name": "PORRIDGE OATS", "quantity": 2, "cost": 0.75 }
//         ]
//     };
// }

// const Title = ({ text } : { text: string }) => {
//     return (
//         <div className="h-[5vh] border-b-1 border-b-[#a9a9a9]">
//             <h2 className="text-[var(--hounslow-primary)] text-xl md:text-2xl font-bold">{ text }</h2>
//         </div>
//     )
// }

// const Upload = () => {
//     const [receiptData, setReceiptData] = useState(getReceiptData());
//     const name = "hotel_for_jim.jpg";   // retrieve image name from S3 bucket

//     const handleAddItem = () => {
//         let newRow = { "name": "", "quantity": 0, "cost": 0.00 }
//         setReceiptData((prevData) => ({
//             ...prevData,
//             items: [...prevData.items, newRow]
//         }));
//     }

//     const handleDeleteItem = (index: number) => {
//         setReceiptData((prevData) => ({
//             ...prevData,
//             items: prevData.items.filter((_, i) => i !== index) // Remove item at the given index
//         }));
//     }

//     return (
//         <div className="overflow-scroll">
//             <Title text={ name } />
//             <Form 
//                 receiptData={ receiptData } 
//                 handleAddItem={ handleAddItem } 
//                 handleDeleteItem={ handleDeleteItem } 
//             />
//         </div>
//     )
// }

// export default Upload; 

'use client';

import { useState } from "react";
import Form from '@/app/components/receipts/form/Form';
import { useSearchParams } from "next/navigation";

type Item = {
  name: string;
  quantity: number;
  cost: number;
};

type AnalysisResult = {
  total: string;
  items: Item[];
  timeTaken: number;
  cost: number;
  tokenInfo?: {
    inputTokens: number;
    outputTokens: number;
  };
};

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

  const name = "hotel_for_jim.jpg"; // Retrieve image name from S3 bucket

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
