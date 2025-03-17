import { useState, useEffect } from "react";

type AbcdProps = {
  fontColour: string | null;
};

const Abc = ( {fontColour} : AbcdProps) => {

  useEffect(() => {
    const root = document.documentElement;
    // Update the --hounslow-primary variable based on the theme
    root?.style.setProperty(
      "--hounslow-primary",
      fontColour // Dark theme: black, Light theme: white
    );
  }, [fontColour]);

  return (
    <div>

      <div style={{ color: "var(--hounslow-primary)" }} >Toggle Dark Theme</div>
        
    </div>
  );
};

export default Abc;