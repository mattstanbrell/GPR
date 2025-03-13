"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_FILE_SIZE_IN_MB, VALID_IMAGE_TYPES } from "@/app/constants/global";
import type { Schema } from "../../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import { Amplify } from "aws-amplify";
import outputs from "../../../../amplify_outputs.json"

Amplify.configure(outputs)

const Title = () => <h1 className="govuk-heading-l">Upload Receipt</h1>;

const UploadFileBody = () => (
  <>
    <label className="govuk-label" htmlFor="receipt-upload">
      Upload a receipt image
    </label>
    <div className="govuk-hint">
      Files must be JPG, PNG, WEBP, HEIC or HEIF, and less than 20MB.
    </div>
  </>
);

const PageError = ({ error }: { error: string }) => (
  <p id="receipt-upload-error" className="govuk-error-message">
    <span className="govuk-visually-hidden">Error:</span> {error}
  </p>
);

const LoadingMessage = () => (
  <div className="govuk-body">
    <progress className="govuk-progress">
      <span className="govuk-visually-hidden">Loading...</span>
    </progress>
    Analyzing receipt...
  </div>
);

const ReceiptPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const client = generateClient<Schema>();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    if (file.size > MAX_FILE_SIZE_IN_MB * 1024 * 1024) {
      setError(`The selected file must be smaller than ${MAX_FILE_SIZE_IN_MB}MB`);
      return;
    }
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      setError("The selected file must be a JPG, PNG, WEBP, HEIC or HEIF");
      return;
    }
    setFile(file);
    setIsLoading(true);

    try {
      // Convert the file to a base64 string
      const bytes = await file.arrayBuffer();
      const currentBuffer = Buffer.from(new Uint8Array(bytes));
      const base64Data = currentBuffer.toString("base64");

      // Call the deployed Lambda function via Amplify Data client
      const result = await client.queries.receiptReader({
        base64Data,
        mimeType: file.type,
      });

    const uploadPath = `uploads/${Date.now()}_${file.name}`;
    const uploadResult = await uploadData({
      path: uploadPath,
      data: currentBuffer,
      options: {
        contentType: file.type,
        bucket: 'receipts',
      },
    }).result;

    console.log(uploadResult);

      // Navigate with the result
      router.push(`/form/3/upload?result=${encodeURIComponent(JSON.stringify(result))}`);
    } catch (error) {
      console.error("Error analyzing receipt:", error);
      setError(
        error instanceof Error ? error.message : "Failed to analyze receipt"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper">
        <Title />
        <div className={`govuk-form-group${error ? " govuk-form-group--error" : ""}`}>
          <UploadFileBody />
          {error && <PageError error={error} />}
          <div
            className="govuk-file-drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ textAlign: "center" }}
          >
            <input
              type="file"
              id="receipt-upload"
              name="receipt-upload"
              className={`govuk-file-upload${error ? " govuk-file-upload--error" : ""}`}
              accept="image/*"
              onChange={handleFileInput}
              aria-describedby={error ? "receipt-upload-error" : undefined}
            />
          </div>
        </div>
        {isLoading && <LoadingMessage />}
      </main>
    </div>
  );
};

export default ReceiptPage;
