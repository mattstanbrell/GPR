import { useState, useEffect } from "react";

// default word spacing is 0.25em
// default letter spacing is 0
const SPACING_SCALE = 0.08;

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
    // Update the --hounslow-primary variable based on the theme
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
      `${spacing*SPACING_SCALE + 0.25}em` // base word-spacing is "normal", which by default is 0.25 rem
    );
    root?.style.setProperty(
      "--letter-spacing",
      `${spacing*SPACING_SCALE}em` // base letter-spacing is "noraml", which by default is 0
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