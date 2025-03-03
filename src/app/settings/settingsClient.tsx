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
  setFontSize(2)
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
              <select style={{width: "min(700px, 60%)"}} className="govuk-select" defaultValue="standard">
                <option value="1x">Standard (1x)</option>
                <option value="2x">Large (2x)</option>
                <option value="3x">Extra Large (3x)</option>
                <option value="4x">Ultra Large (4x)</option>
              </select>
            </div>
            <div style={{ width: "100%", height: "1px", backgroundColor: "#b1b4b6", marginTop: "15px", marginBottom: "15px" }}></div>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}} className="form__control">
              <label className="govuk-label">Font</label>
              <select style={{width: "min(700px, 60%)"}} className="govuk-select" defaultValue="standard">
                <option value="standard">Standard (Lexend)</option>
                <option value="times">Times</option>
                <option value="courier">Courier</option>
                <option value="arial">Arial</option>
              </select>
            </div>
            <div style={{ width: "100%", height: "1px", backgroundColor: "#b1b4b6", marginTop: "15px", marginBottom: "15px" }}></div>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}} className="form__control">
              <label className="govuk-label">Letter spacing</label>
              <select style={{width: "min(700px, 60%)"}} className="govuk-select" defaultValue="standard">
                <option value="0">Standard (0)</option>
                <option value="+1">+1</option>
                <option value="+2">+2</option>
                <option value="+3">+3</option>
              </select>
            </div>
            <div style={{ width: "100%", height: "1px", backgroundColor: "#b1b4b6", marginTop: "15px", marginBottom: "15px" }}></div>
            <fieldset className="govuk-fieldset">
              <h3 className="govuk-heading-m">Choose your colour preferences</h3>
              <div className="govuk-radios" data-module="govuk-radios">
                <label className="form__label--radio" style={{backgroundColor: '#f1f0f0'}}>
                  <input className="form__radio" name="color-pref" type="radio" value="standard" defaultChecked style={{width: '1.1875rem', height: '1.1875rem'}}/>
                  Standard
                </label>
                <label className="form__label--radio" style={{backgroundColor: '#000',color: '#ff0'}}>
                  <input className="form__radio" name="color-pref" type="radio" value="high-contrast" style={{width: '1.1875rem', height: '1.1875rem'}}/>
                  High contrast
                </label>
                <label className="form__label--radio" style={{backgroundColor: '#fff9d2'}}>
                  <input className="form__radio" name="color-pref" type="radio" value="cream" style={{width: '1.1875rem', height: '1.1875rem'}}/>
                  Cream
                </label>
                <label className="form__label--radio" style={{backgroundColor: '#9fcfff'}}>
                  <input className="form__radio" name="color-pref" type="radio" value="blue" style={{width: '1.1875rem', height: '1.1875rem'}}/>
                  Blue
                </label>
              </div>
            </fieldset>
            <div style={{ width: "100%", height: ".25rem", backgroundColor: "#f0e8f0", marginTop: "25px", marginBottom: "15px" }}></div>
            <div className="setting-buttons" style={{display: 'flex', justifyContent: 'space-evenly'}}>
              <button type="submit" className="settings-button--reset" data-module="govuk-button">
                Reset to default
              </button>
              <button type="submit" className="settings-button--save" data-module="govuk-button">
                Save and continue
              </button>
              <button type="submit" className="settings-button--preview" data-module="govuk-button">
                Preview
              </button>
            </div>
            <div style={{ width: "100%", height: "1px", backgroundColor: "#b1b4b6", marginTop: "15px", marginBottom: "15px" }}></div>
            <div>
              <h3 className="govuk-heading-m">Preview</h3>
              <div>
                <p className="govuk-body-s">
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Etiam vestibulum velit eu nunc. Nullam adipiscing condimentum augue.
                </p>
                <p className="govuk-body-s">
                  Praesent tellus velit, ultricies sed, ornare eu, consectetuer sit amet, felis. Sed mollis vestibulum mauris. Nunc a tortor vitae nibh faucibus interdum.
                </p>
                <p className="govuk-body-s">
                  Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce vitae eros. Cras interdum.
                </p>
                <p className="govuk-body-s">
                  Vivamus quam nunc, consequat quis, volutpat non, venenatis sed, nisi. In pede. Cras ut nulla. Etiam scelerisque, est at aliquet suscipit, augue ipsum euismod justo, vitae pellentesque nulla erat nec tellus. Sed a dui sit amet pede tempor semper. In hac habitasse platea dictumst.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}