"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Table } from "@/app/components/form/attachments/Table"
import { UploadIcon } from "@/app/components/form/attachments/Icons";
import { listReceipts } from "@/utils/apis"

const Attachments = () => {
  const router = useRouter();
  const params = useParams<{slug: string}>();
  const { slug } = params; 
  console.log("Current slug:", slug);
  const receipts = listReceiptsByFormId(slug).then(receipts => console.log(receipts));
  
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const [uploadedReceiptNames, setUploadedNames] = useState<string[]>([]); //useState<string[]>(["hello.png", "test.jpg"]);
  const [hasReceipts, setHasReceipts] = useState<boolean>(false); 
  const [isLoadingReceipts, setIsLoadingReceipts] = useState<boolean>(true); 

  useEffect(() => {
    const fetchFormAttachments = async () => {
      const receipts = await listReceipts()
      setUploadedNames(receipts.map(({ name }) => name ));
      setIsLoadingReceipts(false);
      setHasReceipts(receipts.length > 0) 
    }
    fetchFormAttachments(); 
  })

  const handleOptions = () => {
    setIsOptionsOpen(!(isOptionsOpen)); 
  }

  const handleDownload = () => {
    // TODO: implement download logic or call server function 
  }

  return (
    <div className="govuk-width-container">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl" style={{marginBottom: '0'}}>(Form Name)</h1>
          <span className="govuk-caption-m">Attachments</span>
          <div
            style={{
              width: "100%",
              height: ".25rem",
              backgroundColor: "#AA8CAE",
              marginTop: "25px",
              marginBottom: "15px",
            }}
          ></div>
          { !(isLoadingReceipts) &&
            <>
            { hasReceipts ? (
              <h3>No receipts to show.</h3> 
            ) : (
              <Table uploadedReceiptNames={ uploadedReceiptNames } handleOptions={ handleOptions } /> 
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
