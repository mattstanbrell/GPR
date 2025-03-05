import SettingsClient from "./settingsClient";

async function getUserSettings() {
  // REPLACE with call to DB to fetch audit logs data
  return { fontSize: 1, font: "standard", fontColour: "#000000", bgColour: "#FFFFFF", spacing: 0 };
}

export default async function SettingsPage() {
  const userSettings = await getUserSettings();

    return (
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <SettingsClient userSettings={userSettings}/>
          </div>
        </div>
      </div>
    );
  }