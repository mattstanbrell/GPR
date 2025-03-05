"use client"
import * as React from 'react';

type userSettings = {
  fontSize: number;
  font: string;
  fontColour: string;
  bgColour: string;
  spacing: number;
};

interface UserSettingsProps {
  userSettings: userSettings;
}


export default function Preview({ userSettings }: UserSettingsProps) {
  const { fontSize, font, fontColour, bgColour, spacing } = userSettings;
  console.log(userSettings)
  return (
    <div>
    <h3 className="govuk-heading-m">Preview</h3>
    <div>
    <p className="govuk-body-s" style={{float: 'left', color: fontColour, backgroundColor: bgColour}}>
      <img src={'/preview_image.gif'} alt="Preview image" style={{float: 'right'}} />
      Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Etiam vestibulum velit eu nunc. Nullam adipiscing condimentum augue.
      <br/>
      Praesent tellus velit, ultricies sed, ornare eu, consectetuer sit amet, felis. Sed mollis vestibulum mauris. Nunc a tortor vitae nibh faucibus interdum.
      <br/>
      Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce vitae eros. Cras interdum.
      <br/>
      Vivamus quam nunc, consequat quis, volutpat non, venenatis sed, nisi. In pede. Cras ut nulla. Etiam scelerisque, est at aliquet suscipit, augue ipsum euismod justo, vitae pellentesque nulla erat nec tellus. Sed a dui sit amet pede tempor semper. In hac habitasse platea dictumst.
    </p>
    </div>
  </div>
  );
}