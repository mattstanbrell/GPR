'use client'

import SettingsClient from "./SettingsClient";

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