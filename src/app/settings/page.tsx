'use client'

import SettingsClient from "./SettingsClient";

// async function getUserSettings() {
//   // REPLACE with call to DB to fetch audit logs data
//   return { fontSize: 1, font: "lexend", fontColour: "#000000", bgColour: "#FFFFFF", spacing: 0 };
// }

export default function SettingsPage() {

  return (
    <div className="govuk-width-container">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <SettingsClient/>
        </div>
      </div>
    </div>
  );
}