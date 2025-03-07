"use client";

import { useState } from "react";

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

type AnalysisError = {
  error: string;
};

type ModelResult = AnalysisResult | AnalysisError;

export default function ReceiptPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ModelResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setResult(null);

    // Validate file size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError("The selected file must be smaller than 20MB");
      return;
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (!validTypes.includes(file.type)) {
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
      setResult(data);
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

  const renderResult = (result: ModelResult | null) => {
    if (!result) {
      return null;
    }

    if ("error" in result) {
      return (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">Error</h2>
          <div className="govuk-error-summary__body">{result.error}</div>
        </div>
      );
    }

    return (
      <div className="govuk-panel govuk-panel--confirmation">
        <h2 className="govuk-panel__title">Receipt Analysis</h2>
        <div className="govuk-panel__body">
          <div style={{ marginTop: "12px", marginBottom: "12px" }}>
            Total: {result.total}
          </div>
          <div style={{ color: "white", fontSize: "16px", marginTop: "8px" }}>
            <div>Time: {result.timeTaken}ms</div>
            <div>Cost: ${result.cost.toFixed(6)}</div>
            {result.tokenInfo && (
              <div>
                Tokens: {result.tokenInfo.inputTokens} in /{" "}
                {result.tokenInfo.outputTokens} out
              </div>
            )}
          </div>
          <div style={{ marginTop: "20px" }}>
            <h3>Items:</h3>
            <ul>
              {result.items.map((item, index) => (
                <li key={index}>
                  {item.name} (Qty: {item.quantity}, Cost: £{item.cost})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-l">Upload Receipt</h1>

        <div
          className={`govuk-form-group${error ? " govuk-form-group--error" : ""}`}
        >
          <label className="govuk-label" htmlFor="receipt-upload">
            Upload a receipt image
          </label>
          <div className="govuk-hint">
            Files must be JPG, PNG, WEBP, HEIC or HEIF, and less than 20MB.
          </div>
          {error && (
            <p id="receipt-upload-error" className="govuk-error-message">
              <span className="govuk-visually-hidden">Error:</span> {error}
            </p>
          )}
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

        {isLoading && !result && (
          <div className="govuk-body">
            <progress className="govuk-progress">
              <span className="govuk-visually-hidden">Loading...</span>
            </progress>
            Analyzing receipt...
          </div>
        )}

        {result && renderResult(result)}
      </main>
    </div>
  );
}