"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AttachmentTable } from "@/app/components/form/attachments/AttachmentTable"
import { UploadIcon } from "@/app/components/form/attachments/Icons";
import { listReceiptsByFormId, deleteReceipt } from "@/utils/apis"
import { Receipt } from "@/app/types/models";
import { downloadData, remove } from 'aws-amplify/storage';
     

const Attachments = ({ formName } : { formName: string }) => {
  const router = useRouter();
  const params = useParams<{slug: string}>();
  const { slug } = params; 
  const [uploadedReceiptNames, setUploadedNames] = useState<string[]>([]);
  const [hasReceipts, setHasReceipts] = useState<boolean>(false); 
  const [isLoadingReceipts, setIsLoadingReceipts] = useState<boolean>(true); 
  const [formReceipts, setFormReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    const fetchFormAttachments = async () => {
      const receipts = await listReceiptsByFormId(slug);
      const receiptNames: string[] = [];
      receipts.map(({ receiptName: name }) => {
        receiptNames.push(name ? name : "")
      })
      setUploadedNames(receiptNames);
      setIsLoadingReceipts(false);
      setHasReceipts(receipts.length > 0);
      setFormReceipts(receipts)
    }
    fetchFormAttachments(); 
  }, [slug])
  

  const handleDownload = async (index: number) => {
    try {
      const receipt = formReceipts[index];

      if (!receipt || !receipt.s3Key) {
        console.error("No receipt found or s3Key is missing.");
        return;
      }

      const s3Key = receipt.s3Key as string;
  
    const { body } = await downloadData({
      path: s3Key,
    }).result;

    const blob = new Blob([body as unknown as BlobPart], { type: "image/*" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = receipt.receiptName || "receipt"; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error downloading the receipt:", error);
    }
  };

  const handleDelete = async (index: number) => {
    try{
      const receipt = formReceipts[index];
      if (receipt.s3Key) {
        await remove({path: receipt.s3Key});
      }

      await deleteReceipt(receipt.id);

      const updatedReceipts = formReceipts.filter((_, i) => i !== index);
      setFormReceipts(updatedReceipts);

      const updatedReceiptNames = updatedReceipts.map((r) => r.receiptName || "");
      setUploadedNames(updatedReceiptNames);
      
      setHasReceipts(updatedReceipts.length > 0);


    } catch (error) {
      console.error("Error deleting the receipt:", error);
    }
  }

  return (
    <div className="govuk-width-container">
      <div className="govuk-grid-row flex justify-center">
        <div className="govuk-grid-column-two-thirds overflow-x-scroll">
          <h1 className="govuk-heading-xl" style={{marginBottom: '0'}}>{ formName }</h1>
          <span className="govuk-caption-m pb-4 mb-4 border-solid border-b-4 border-[#AA8CAE]">Attachments</span>
          { !(isLoadingReceipts) &&
            <>
            { !(hasReceipts) ? (
              <h3>No receipts receipreceiptststo show.</h3> 
            ) : (
              <AttachmentTable 
                receiptNames={ uploadedReceiptNames } 
                handleDownload={ handleDownload }
                handleDelete={ handleDelete }
              /> 
            )}
            </>
          }
          
          <UploadIcon onClick={() => router.push(`/form/${slug}/receipt`)}/> 
        </div>
      </div>
    </div>
  );
}

export default Attachments;
