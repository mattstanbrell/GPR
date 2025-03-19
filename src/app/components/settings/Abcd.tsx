import { useEffect } from "react";
import { updateUserSettingColorThemes } from "@/utils/settingsUtils";

const WORD_SPACING_SCALE = 0.05;
const LETTER_SPACING_SCALE = 0.05;

type AbcdProps = {
  fontSize: number;
  font: string;
  fontColour: string;
  bgColour: string;
  spacing: number;
};

const Abc = ( {fontSize, font, fontColour, bgColour, spacing} : AbcdProps) => {

  useEffect(() => {

    const selectedThemeLabel = getSelectedThemeLabel(fontColour, bgColour);
    
    const root = document.documentElement;

    updateUserSettingColorThemes(selectedThemeLabel);

    root?.style.setProperty(
      "--font-size",
      `${fontSize}`
    );
    root?.style.setProperty(
      "--font-family",
      font
    );
    root?.style.setProperty(
      "--word-spacing",
      `${spacing*WORD_SPACING_SCALE + 0.25}em` // base word-spacing is "normal", which by default is 0.25 rem
    );
    root?.style.setProperty(
      "--letter-spacing",
      `${spacing*LETTER_SPACING_SCALE}em` // base letter-spacing is "noraml", which by default is 0
    );
    
  }, [fontSize, font, fontColour, bgColour, spacing]);

  const getSelectedThemeLabel = (fontColour: string, bgColour: string): string => {
    if (fontColour === "#000000" && bgColour === "#FFFFFF") {
      return "standard";
    }
    if (fontColour === "#FF0" && bgColour === "#000") {
      return "high-contrast";
    }
    if (fontColour === "#000000" && bgColour === "#fff9d2") {
      return "cream";
    }
    if (fontColour === "#000000" && bgColour === "#9fcfff") {
      return "blue";
    }
    return "standard";
  };

  const selectedThemeLabel = getSelectedThemeLabel(fontColour, bgColour);

  console.log("label",selectedThemeLabel);

  return (
    <div>

      <div style={{ 

        fontFamily: "var(--font-family)", 
        color: "var(--hounslow-primary)", 
        backgroundColor: "var(--color-background-lightest)",
        letterSpacing: "var(--letter-spacing)",
        wordSpacing: "var(--word-spacing)"
        }} 
      >
        Preview
      </div>
        
    </div>
  );
};

export default Abc;