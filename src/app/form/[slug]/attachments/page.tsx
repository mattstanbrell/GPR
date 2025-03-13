"use client";
import * as React from 'react';
import AttachmentsList from "./AttachmentsList";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from 'next/link';

const Attachments = () => {
  const router = useRouter();
  const params = useParams();
  const { slug } = params; // assuming the page route is form/[slug]/attachments
  console.log("Current slug:", slug);

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

          {/* Now push to the receipt page using the current slug */}
          <button onClick={() => router.push(`/form/${slug}/receipt`)}>
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

export default Attachments;
