import { useEffect } from "react";

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
    const root = document.documentElement;
    root?.style.setProperty(
      "--font-size",
      `${fontSize}`
    );
    root?.style.setProperty(
      "--font-family",
      font
    );
    root?.style.setProperty(
      "--hounslow-primary",
      fontColour
    );
    root?.style.setProperty(
      "--color-background-lightest",
      bgColour
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