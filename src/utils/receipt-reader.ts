import { type NextRequest, NextResponse } from "next/server";
import { convertHeicToJpeg } from "../utils/image-utils";
import {
  SUPPORTED_MIME_TYPES,
  CONVERTIBLE_TYPES,
  MAX_FILE_SIZE,
} from "../../amplify/shared/types";
import { handler } from "../../amplify/functions/receipt-reader/handler";

function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / 1024 ** i)} ${sizes[i]}`;
}

function logSize(message: string, size: number) {
  const formattedSize = formatBytes(size);
  const logMessage = `[RECEIPT ANALYSIS] ${message}: ${formattedSize}`;
  console.log(logMessage);
  return logMessage;
}

export async function POST(request: NextRequest) {
  const logs: string[] = [];
  try {
    // Log the raw request details
    console.log(
      "[RECEIPT ANALYSIS] Request headers:",
      Object.fromEntries(request.headers.entries()),
    );

    const formData = await request.formData();
    console.log(
      "[RECEIPT ANALYSIS] FormData keys:",
      Array.from(formData.keys()),
    );

    const file = formData.get("receipt") as File;
    console.log("[RECEIPT ANALYSIS] File object:", {
      name: file?.name,
      type: file?.type,
      size: file?.size,
    });

    if (!file) {
      throw new Error("No file provided");
    }

    // Log file details before processing
    logs.push(logSize("Original file size", file.size));

    // Process file
    const bytes = await file.arrayBuffer();
    let currentBuffer = Buffer.from(bytes);
    logs.push(
      logSize("Buffer size after initial conversion", currentBuffer.length),
    );

    let mimeType = file.type;

    // Convert HEIC/HEIF if needed
    if (CONVERTIBLE_TYPES.includes(file.type)) {
      const converted = await convertHeicToJpeg(currentBuffer);
      currentBuffer = Buffer.from(
        new Uint8Array(converted.data.buffer, converted.data.byteOffset, converted.data.byteLength)
      );
      mimeType = converted.mimeType;
      logs.push(logSize("Size after HEIC conversion", currentBuffer.length));
    } else if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    const base64Data = currentBuffer.toString("base64");
    logs.push(logSize("Base64 string size", base64Data.length));

    // Validate file size
    if (base64Data.length > MAX_FILE_SIZE) {
      throw new Error(
        `File size (${formatBytes(base64Data.length)}) exceeds limit of ${formatBytes(MAX_FILE_SIZE)}`,
      );
    }

    // Mock context and callback for the Lambda handler
    const context = {} as any; // Mock context
    const callback = () => {}; // No-op callback

    // Send the image to the GPT-4 model
    console.log("[RECEIPT ANALYSIS] Sending to GPT-4...");
    const response = (await handler(
      {
        body: base64Data,
        headers: {
          "content-type": mimeType,
        },
      },
      context, // Add the context argument
      callback, // Add the callback argument
    )) as { statusCode: number; body: string };

    const result = JSON.parse(response.body);
    console.log("[RECEIPT ANALYSIS] GPT-4 response:", result);

    // Return the result
    return NextResponse.json(result, {
      status: response.statusCode,
      headers: {
        "X-Size-Logs": logs.join(" | "),
      },
    });
  } catch (error) {
    console.error("[RECEIPT ANALYSIS] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process receipt",
        message: error instanceof Error ? error.message : String(error),
        logs: logs,
      },
      {
        status: 500,
        headers: {
          "X-Size-Logs": logs.join(" | "),
        },
      },
    );
  }
}