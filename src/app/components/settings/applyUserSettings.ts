import { updateUserSettingColorThemes } from "@/utils/settingsUtils";

const WORD_SPACING_SCALE = 0.05;
const LETTER_SPACING_SCALE = 0.05;

type ApplyUserSettingsProps = {
  fontSize: number;
  font: string;
  fontColour: string;
  bgColour: string;
  spacing: number;
};

export const applyUserSettings = ({ fontSize, font, fontColour, bgColour, spacing }: ApplyUserSettingsProps) => {
  const getSelectedThemeLabel = (fontColour: string, bgColour: string): string => {
    if (fontColour === "#000000" && bgColour === "#FFFFFF") return "standard";
    if (fontColour === "#FF0" && bgColour === "#000") return "high-contrast";
    if (fontColour === "#000000" && bgColour === "#fff9d2") return "cream";
    if (fontColour === "#000000" && bgColour === "#9fcfff") return "blue";
    return "standard";
  };

  const selectedThemeLabel = getSelectedThemeLabel(fontColour, bgColour);
  const root = document.documentElement;

  // Apply color themes
  updateUserSettingColorThemes(selectedThemeLabel);

  // Apply font and spacing settings
  root.style.setProperty("--font-size", `${fontSize}`);
  root.style.setProperty("--font-family", font);
  root.style.setProperty("--word-spacing", `${spacing * WORD_SPACING_SCALE + 0.25}em`);
  root.style.setProperty("--letter-spacing", `${spacing * LETTER_SPACING_SCALE}em`);
};