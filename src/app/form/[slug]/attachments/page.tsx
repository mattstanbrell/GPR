"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AttachmentTable } from "@/app/components/form/attachments/AttachmentTable"
import { UploadIcon } from "@/app/components/form/attachments/Icons";
import { listReceiptsByFormId } from "@/utils/apis"
import { Receipt } from "@/app/types/models";

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
    }
    fetchFormAttachments(); 
  }, [slug])

  const handleDownload = (index: number) => {
    // TODO: implement download logic or call server function 
    console.log("this is the download button being called")
  }

  const handleDelete = (index: number) => {
    // TODO: implement delete logic or call server function 
    console.log("this is the delete button being called")
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
