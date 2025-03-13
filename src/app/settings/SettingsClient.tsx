'use client'
import * as React from 'react';
import Preview from './Preview';

import { useState, useEffect } from 'react';
import { updateUserSettings, getUserSettingsByUserId } from '@/utils/apis';
import { useUserModel } from '@/utils/authenticationUtils';

const DEFAULT_FONT_SIZE = 1;
const DEFAULT_FONT = 'lexend';
const DEFAULT_FONT_COLOUR = '#000000';
const DEFAULT_BG_COLOUR = '#FFFFFF';
const DEFAULT_SPACING = 0;

//add crumbs!!!

// type UserSettingsProps = Promise<{userSettings: {fontSize: number, fontColour: string}}>
type UserSettings = {
  fontSize: number | null;
  font: string | null;
  fontColour: string | null;
  bgColour: string | null;
  spacing: number | null;
};

export default function SettingsClient() {
  const [loaded, setLoaded] = useState(false);
  const [currentUserSettings, setCurrentUserSettings] = useState<UserSettings | null>();

  const userModel = useUserModel();

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        if (userModel?.id) {
          const userSettings = await getUserSettingsByUserId(userModel.id);
          setCurrentUserSettings(userSettings);
        }
      } catch (error) {
        console.error("Failed to fetch user settings:", error);
      } finally {
        setLoaded(true);
      }
    };
    fetchUserSettings();
  }, []);

  const [fontSize, setFontSize] = React.useState(currentUserSettings?.fontSize ?? DEFAULT_FONT_SIZE);
  const [font, setFont] = React.useState(currentUserSettings?.font ?? DEFAULT_FONT)
  const [spacing, setSpacing] = React.useState(currentUserSettings?.spacing ?? DEFAULT_SPACING);
  const [fontColour, setFontColour] = React.useState(currentUserSettings?.fontColour ?? DEFAULT_FONT_COLOUR);
  const [bgColour, setBgColour] = React.useState(currentUserSettings?.bgColour ?? DEFAULT_BG_COLOUR);

  const [tempFontSize, setTempFontSize] = React.useState(currentUserSettings?.fontSize ?? DEFAULT_FONT_SIZE);
  const [tempFont, setTempFont] = React.useState(currentUserSettings?.font ?? DEFAULT_FONT);
  const [tempSpacing, setTempSpacing] = React.useState(currentUserSettings?.spacing ?? DEFAULT_SPACING);
  const [tempFontColour, setTempFontColour] = React.useState(currentUserSettings?.fontColour ?? DEFAULT_FONT_COLOUR);
  const [tempBgColour, setTempBgColour] = React.useState(currentUserSettings?.bgColour ?? DEFAULT_BG_COLOUR);

  const handleFontSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFontSize = parseFloat(event.target.value);
    setTempFontSize(selectedFontSize);
    console.log(`Font size set to: ${selectedFontSize}`);
  };

  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFont = event.target.value;
    setTempFont(selectedFont);
    console.log(`Font set to: ${selectedFont}`);
  };

  const handleSpacingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSpacing = parseInt(event.target.value);
    setTempSpacing(selectedSpacing);
    console.log(`Spacing set to: ${selectedSpacing}`);
  };

  const handleColourChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedColours = JSON.parse(event.target.value)
    const selectedFontColour = selectedColours.fontColour;
    const selectedBgColour = selectedColours.bgColour;
    setTempFontColour(selectedFontColour)
    setTempBgColour(selectedBgColour);
    console.log(`Bg colour set to: ${selectedBgColour} and Font colour set to: ${selectedFontColour}`);
  };

  const updateSettings = (fontSize: number, font: string, spacing: number, fontColour: string, bgColour: string) => {
    setFontSize(fontSize);
    setFont(font);
    setSpacing(spacing);
    setFontColour(fontColour);
    setBgColour(bgColour);
    if (userModel?.id) {
      updateUserSettings(userModel.id, { fontSize, font, spacing, fontColour, bgColour });
    } else {
      console.error("User ID is undefined. Cannot update settings.");
    }
  }

  const handleSettingsChange = (e: React.FormEvent) => {
    e.preventDefault();

    const buttonClicked = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
    const action = buttonClicked.value;

    if (action === "reset") {
      resetSettings();
    } else if (action === "save") {
      saveSettings();
    } else if (action === "preview") {
      previewSettings();
    } else {
      console.log("Unknown action");
    };
  };

  const resetSettings = () => {
    updateSettings(DEFAULT_FONT_SIZE, DEFAULT_FONT, DEFAULT_SPACING, DEFAULT_FONT_COLOUR, DEFAULT_BG_COLOUR);
  }

  const saveSettings = () => {
    // call API to update settings
    updateSettings(tempFontSize, tempFont, tempSpacing, tempFontColour, tempBgColour);
  }

  const previewSettings = () => {
    setFontSize(tempFontSize);
    setFont(tempFont);
    setSpacing(tempSpacing);
    setFontColour(tempFontColour);
    setBgColour(tempBgColour);
  }
  
  return (
    <div>
      <h1 className="govuk-heading-xl" style={{ backgroundColor: '#e5f2eb' }} >Settings</h1>
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
          Should you wish to return to the standard settings, use the &quot;Reset&quot; button.
        </p>
        <form onSubmit={handleSettingsChange}>
          <h3 className="govuk-heading-m">Choose your text preferences</h3>
          <div className="govuk-form-group">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}} className="form__control">
              <label className="govuk-label">Font size</label>
              <select style={{width: "min(700px, 60%)"}} className="govuk-select" defaultValue={1} onChange={handleFontSizeChange}>
                <option value={1}>1x (Standard)</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
                <option value={2.5}>2.5x</option>
              </select>
            </div>
            <div style={{ width: "100%", height: "1px", backgroundColor: "#b1b4b6", marginTop: "15px", marginBottom: "15px" }}></div>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}} className="form__control">
              <label className="govuk-label">Font</label>
              <select style={{width: "min(700px, 60%)"}} className="govuk-select" defaultValue="lexend" onChange={handleFontChange}>
                <option value="lexend">Lexend (Standard)</option>
                <option value="times">Times</option>
                <option value="courier">Courier</option>
                <option value="arial">Arial</option>
              </select>
            </div>
            <div style={{ width: "100%", height: "1px", backgroundColor: "#b1b4b6", marginTop: "15px", marginBottom: "15px" }}></div>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}} className="form__control">
              <label className="govuk-label">Letter spacing</label>
              <select style={{width: "min(700px, 60%)"}} className="govuk-select" defaultValue={0} onChange={handleSpacingChange}>
                <option value={0}>0 (Standard)</option>
                <option value={1}>+1</option>
                <option value={2}>+2</option>
                <option value={3}>+3</option>
              </select>
            </div>
            <div style={{ width: "100%", height: "1px", backgroundColor: "#b1b4b6", marginTop: "15px", marginBottom: "15px" }}></div>
            <fieldset className="govuk-fieldset">
              <h3 className="govuk-heading-m">Choose your colour preferences</h3>
              <div className="govuk-radios" data-module="govuk-radios">
                <label className="form__label--radio" style={{backgroundColor: '#f1f0f0'}}>
                  <input onChange={handleColourChange} value='{"fontColour": "#000000", "bgColour": "#FFFFFF"}' className="form__radio" name="color-pref" type="radio" defaultChecked style={{width: '1.1875rem', height: '1.1875rem'}}/>
                  Standard
                </label>
                <label className="form__label--radio" style={{backgroundColor: '#000',color: '#ff0'}}>
                  <input onChange={handleColourChange} value='{"fontColour": "#FF0", "bgColour": "#000"}' className="form__radio" name="color-pref" type="radio" style={{width: '1.1875rem', height: '1.1875rem'}}/>
                  High contrast
                </label>
                <label className="form__label--radio" style={{backgroundColor: '#fff9d2'}}>
                  <input onChange={handleColourChange} value='{"fontColour": "#000000", "bgColour": "#fff9d2"}' className="form__radio" name="color-pref" type="radio" style={{width: '1.1875rem', height: '1.1875rem'}}/>
                  Cream
                </label>
                <label className="form__label--radio" style={{backgroundColor: '#9fcfff'}}>
                  <input onChange={handleColourChange} value='{"fontColour": "#000000", "bgColour": "#9fcfff"}' className="form__radio" name="color-pref" type="radio" style={{width: '1.1875rem', height: '1.1875rem'}}/>
                  Blue
                </label>
              </div>
            </fieldset>
            <div style={{ width: "100%", height: ".25rem", backgroundColor: "#f0e8f0", marginTop: "25px", marginBottom: "15px" }}></div>
            <div className="setting-buttons">
              <button type="submit" value="reset" className="settings-button--reset" data-module="govuk-button">
                Reset to default
              </button>
              <button type="submit" value="save" className="settings-button--save" data-module="govuk-button">
                Save and continue
              </button>
              <button type="submit" value="preview" className="settings-button--preview" data-module="govuk-button">
                Preview
              </button>
            </div>
            <div style={{ width: "100%", height: "1px", backgroundColor: "#b1b4b6", marginTop: "15px", marginBottom: "15px" }}></div>
            <Preview userSettings={{ fontSize, font, spacing, fontColour, bgColour }}/>
          </div>
        </form>
      </div>
    </div>
  );
}
