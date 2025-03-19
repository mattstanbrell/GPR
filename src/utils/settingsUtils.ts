type ColourTheme = {
  colourVar: string;
  colourVal: string;
};

//#FF0 yellow
//#000 black
//#00FF00 green
//#FFF white

const userSettings: Record<string, ColourTheme[]> = {
  'standard': [
    { colourVar: 'hounslow-primary', colourVal: '#642f6c' },
    { colourVar: 'hounslow-primary-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'hounslow-menu-icon-filter', colourVal: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(189deg) brightness(102%) contrast(102%)' },
    { colourVar: 'color-secondary', colourVal: '#986f9e' },
    { colourVar: 'color-accent', colourVal: '#DD57F0' },
    { colourVar: 'color-button-primary', colourVal: '#352238' },
    { colourVar: 'color-button-primary-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'hounslow-menu-icon-filter', colourVal: 'filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(189deg) brightness(102%) contrast(102%);' },
    { colourVar: 'color-button-secondary', colourVal: '#A080A0' },
    { colourVar: 'color-reject', colourVal: '#C76565' },
    { colourVar: 'color-accept', colourVal: '#5E9A5E' },
    { colourVar: 'color-suggestion', colourVal: '#FF90F2' },
    { colourVar: 'color-warning', colourVal: '#D2D47B' },
    { colourVar: 'color-reject-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'color-accept-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'color-suggestion-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'color-warning-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'color-text-light', colourVal: '#FFFCFF' },
    { colourVar: 'color-text-light-alt', colourVal: '#edddef' },
    { colourVar: 'color-text-subheading', colourVal: '#797979' },
    { colourVar: 'color-background-darkest', colourVal: '#2A002A' },
    { colourVar: 'color-background-dark', colourVal: '#540253' },
    { colourVar: 'color-background-medium', colourVal: '#A080A0' },
    { colourVar: 'color-background-light', colourVal: '#F1E6F2' },
    { colourVar: 'color-background-lightest', colourVal: '#FFFFFF' },
    { colourVar: 'color-background-lightest-filter', colourVal: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(189deg) brightness(102%) contrast(102%)' },
  ],
  'high-contrast': [
    { colourVar: 'hounslow-primary', colourVal: '#00FF00' },
    { colourVar: 'hounslow-primary-filter', colourVal: '#FF0000' },
    { colourVar: 'hounslow-menu-icon-filter', colourVal: '#FF0000' },
    { colourVar: 'color-secondary', colourVal: '#00FF00' },
    { colourVar: 'color-accent', colourVal: '#FF0' },
    { colourVar: 'color-button-primary', colourVal: '#00FF00' },
    { colourVar: 'color-button-primary-filter', colourVal: 'filter: invert(50%) sepia(89%) saturate(2298%) hue-rotate(85deg) brightness(129%) contrast(116%);' },
    { colourVar: 'hounslow-menu-icon-filter', colourVal: 'filter: invert(50%) sepia(89%) saturate(2298%) hue-rotate(85deg) brightness(129%) contrast(116%);' },
    { colourVar: 'color-button-secondary', colourVal: '#00FF00' },
    { colourVar: 'color-reject', colourVal: '#00FF00' },
    { colourVar: 'color-accept', colourVal: '#00FF00' },
    { colourVar: 'color-suggestion', colourVal: '#FF0000' },
    { colourVar: 'color-warning', colourVal: '#FF0000' },
    { colourVar: 'color-reject-filter', colourVal: '#FF0000' },
    { colourVar: 'color-accept-filter', colourVal: '#FF0000' },
    { colourVar: 'color-suggestion-filter', colourVal: '#FF0000' },
    { colourVar: 'color-warning-filter', colourVal: '#FF0000' },
    { colourVar: 'color-text-light', colourVal: '#FFFFFF' },
    { colourVar: 'color-text-light-alt', colourVal: '#FF0000' },
    { colourVar: 'color-text-subheading', colourVal: '#FF0000' },
    { colourVar: 'color-background-darkest', colourVal: '#000' },
    { colourVar: 'color-background-dark', colourVal: '#000' },
    { colourVar: 'color-background-medium', colourVal: '#000' },
    { colourVar: 'color-background-light', colourVal: '#000' },
    { colourVar: 'color-background-lightest', colourVal: '#000' }, //set back to black
    { colourVar: 'color-background-lightest-filter', colourVal: '#000' },
  ],
  'cream': [
    { colourVar: 'hounslow-primary', colourVal: '#010066' },
    { colourVar: 'hounslow-primary-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'hounslow-menu-icon-filter', colourVal: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(189deg) brightness(102%) contrast(102%)' },
    { colourVar: 'color-secondary', colourVal: '#010066' },
    { colourVar: 'color-accent', colourVal: '#DD57F0' },
    { colourVar: 'color-button-primary', colourVal: '#352238' },
    { colourVar: 'color-button-primary-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'color-button-secondary', colourVal: '#A080A0' },
    { colourVar: 'color-reject', colourVal: '#C76565' },
    { colourVar: 'color-accept', colourVal: '#5E9A5E' },
    { colourVar: 'color-suggestion', colourVal: '#FF90F2' },
    { colourVar: 'color-warning', colourVal: '#D2D47B' },
    { colourVar: 'color-reject-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'color-accept-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'color-suggestion-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'color-warning-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'color-text-light', colourVal: '#FFFCFF' },
    { colourVar: 'color-text-light-alt', colourVal: '#edddef' },
    { colourVar: 'color-text-subheading', colourVal: '#797979' },
    { colourVar: 'color-background-darkest', colourVal: '#2A002A' },
    { colourVar: 'color-background-dark', colourVal: '#540253' },
    { colourVar: 'color-background-medium', colourVal: '#A080A0' },
    { colourVar: 'color-background-light', colourVal: '#F1E6F2' },
    { colourVar: 'color-background-lightest', colourVal: '#fff9d2' },
    { colourVar: 'color-background-lightest-filter', colourVal: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(189deg) brightness(102%) contrast(102%)' },
  ],
  'blue': [
    { colourVar: 'hounslow-primary', colourVal: '#FF0000' },
    { colourVar: 'hounslow-primary-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'hounslow-menu-icon-filter', colourVal: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(189deg) brightness(102%) contrast(102%)' },
    { colourVar: 'color-secondary', colourVal: '#FF0000' },
    { colourVar: 'color-accent', colourVal: '#DD57F0' },
    { colourVar: 'color-button-primary', colourVal: '#352238' },
    { colourVar: 'color-button-primary-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'color-button-secondary', colourVal: '#A080A0' },
    { colourVar: 'color-reject', colourVal: '#C76565' },
    { colourVar: 'color-accept', colourVal: '#5E9A5E' },
    { colourVar: 'color-suggestion', colourVal: '#FF90F2' },
    { colourVar: 'color-warning', colourVal: '#D2D47B' },
    { colourVar: 'color-reject-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'color-accept-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'color-suggestion-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'color-warning-filter', colourVal: 'brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(5876%) hue-rotate(253deg) brightness(93%) contrast(89%)' },
    { colourVar: 'color-text-light', colourVal: '#FFFCFF' },
    { colourVar: 'color-text-light-alt', colourVal: '#edddef' },
    { colourVar: 'color-text-subheading', colourVal: '#797979' },
    { colourVar: 'color-background-darkest', colourVal: '#2A002A' },
    { colourVar: 'color-background-dark', colourVal: '#540253' },
    { colourVar: 'color-background-medium', colourVal: '#A080A0' },
    { colourVar: 'color-background-light', colourVal: '#F1E6F2' },
    { colourVar: 'color-background-lightest', colourVal: '#9fcfff' },
    { colourVar: 'color-background-lightest-filter', colourVal: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(189deg) brightness(102%) contrast(102%)' },
  ],
};

export const updateUserSettingColorThemes = (themeName: string): void => {
  const root = document.documentElement; // Access the :root element

  // Look up the theme in the userSettings object
  const theme = userSettings[themeName];

  if (!theme) {
    console.error(`Theme "${themeName}" not found.`);
    return;
  }

  // Loop through the theme array and set each CSS variable
  theme.forEach(({ colourVar, colourVal }) => {
    root.style.setProperty(`--${colourVar}`, colourVal);
  });

  // console.log(`Applied theme: ${themeName}`);
};