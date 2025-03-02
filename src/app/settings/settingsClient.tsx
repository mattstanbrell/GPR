"use client"
import * as React from 'react';

// interface UserSettingsProps {
//   fontSize: number;
//   fontColour: string;
// }

type UserSettingsProps = {fontSize: number, fontColour: string}
// type UserSettingsProps = Promise<{userSettings: {fontSize: number, fontColour: string}}>

export default function SettingsClient( props: {userSettings : UserSettingsProps }) {

  const [fontSize, setFontSize] = React.useState(props.userSettings.fontSize);

  console.log(fontSize)

  // const handleFontSizeChange = (event: Event, newValue: number | number[]) => {
  //   setFontSize(newValue as number);
  // };
  
  return (
    <div>
      <h2 className="govuk-heading-l" style={{ backgroundColor: '#e5f2eb' }} >Settings</h2>
      <div>
        <p className="summary"
          style={{
            border: '.25rem solid #f0e8f0',
            color: '#642f6c',
            fontSize: '1.125rem',
            marginBottom: '2.25rem',
            padding: '1.5rem',
          }}
        >
          This page allows you to adapt our website to suit your needs.
          The settings you choose on this page will be saved for future visits.
          Should you wish to return to the standard settings, use the "Reset" button.
        </p>
        <form>
          <h3 className="govuk-heading-m">Choose your text preferences</h3>
          <div className="govuk-form-group">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}} className="form__control">
              <label className="govuk-label">Font size</label>
              <select style={{width: "min(700px, 66.67%)"}} className="govuk-select" id="sort" name="sort" defaultValue="standard">
                <option value="standard">Standard (1x)</option>
                <option value="updated">Large (2x)</option>
                <option value="views">Extra Large (3x)</option>
                <option value="comments">Ultra Large (4x)</option>
              </select>
            </div>
            <div style={{ width: "100%", height: "1px", backgroundColor: "#b1b4b6", marginTop: "15px", marginBottom: "15px" }}></div>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}} className="form__control">
              <label className="govuk-label">Font</label>
              <select style={{width: "min(700px, 66.67%)"}} className="govuk-select" id="sort" name="sort" defaultValue="standard">
                <option value="standard">Standard (Lexend)</option>
                <option value="times">Times</option>
                <option value="courier">Courier</option>
                <option value="arial">Arial</option>
              </select>
            </div>
            <div style={{ width: "100%", height: "1px", backgroundColor: "#b1b4b6", marginTop: "15px", marginBottom: "15px" }}></div>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}} className="form__control">
              <label className="govuk-label">Letter spacing</label>
              <select style={{width: "min(700px, 66.67%)"}} className="govuk-select" id="sort" name="sort" defaultValue="standard">
                <option value="standard">Standard (0)</option>
                <option value="+1">+1</option>
                <option value="+2">+2</option>
                <option value="+3">+3</option>
              </select>
            </div>
            <div style={{ width: "100%", height: "1px", backgroundColor: "#b1b4b6", marginTop: "15px", marginBottom: "15px" }}></div>
          </div>
        </form>
      </div>
    </div>
  );
}