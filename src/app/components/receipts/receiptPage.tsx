"use client"; 

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_FILE_SIZE_IN_MB, VALID_IMAGE_TYPES } from "@/app/constants/global";

const Title = () => {
  return <h1 className="govuk-heading-l">Upload Receipt</h1>
}

const UploadFileBody = () => {
  return (
    <>
      <label className="govuk-label" htmlFor="receipt-upload">
        Upload a receipt image
      </label>
      <div className="govuk-hint">
        Files must be JPG, PNG, WEBP, HEIC or HEIF, and less than 20MB.
      </div>
    </>
  )
}

const PageError = ({error} : {error: string}) => {
  return (
    <p id="receipt-upload-error" className="govuk-error-message">
      <span className="govuk-visually-hidden">Error:</span> 
      { error }
    </p>
  )
}

const LoadingMessage = () => {
  return (
    <div className="govuk-body">
      <progress className="govuk-progress">
        <span className="govuk-visually-hidden">Loading...</span>
      </progress>
      Analyzing receipt...
    </div>
  )
}

const ReceiptPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

    // Validate file size (20MB)
    if (file.size > MAX_FILE_SIZE_IN_MB * 1024 * 1024) {
      setError(`The selected file must be smaller than ${MAX_FILE_SIZE_IN_MB}MB`);
      return;
    }

      if (!(VALID_IMAGE_TYPES.includes(file.type))) {
      setError("The selected file must be a JPG, PNG, WEBP, HEIC or HEIF");
      return;
    }

    setFile(file);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const response = await fetch("/api/receipt-reader", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("API Error:", data);
        throw new Error(data.message || data.error || "Failed to analyze receipt");
      }

      const data = await response.json();

      router.push(`/form/3/upload?result=${encodeURIComponent(JSON.stringify(data))}`); // hardocded form id
    } catch (error) {
      console.error("Error analyzing receipt:", error);
      setError(
        error instanceof Error
          ? error.message
          : "The selected file could not be uploaded – try again",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper">
        <Title />

        <div className={`govuk-form-group${error ? " govuk-form-group--error" : ""}`} >
          <UploadFileBody />
          { error && <PageError error={ error } /> } 
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
}

export default ReceiptPage;