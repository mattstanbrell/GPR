import { useState, useEffect } from "react";

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
      `${fontSize*16}px`
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
      "--spacing",
      `${fontSize*spacing}px`
    );
    
  }, [fontSize, font, fontColour, bgColour, spacing]);

  return (
    <div>

      <div style={{ 
        fontSize: "var(--font-size)", 
        fontFamily: "var(--font-family)", 
        color: "var(--hounslow-primary)", 
        backgroundColor: "var(--color-background-lightest)",
        letterSpacing: "var(--spacing)",
        wordSpacing: "var(--spacing)"
        }} 
      >
        Preview
      </div>
        
    </div>
  );
};

export default Abc;