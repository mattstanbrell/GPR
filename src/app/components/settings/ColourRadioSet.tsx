type ColourRadioSetProps = {
  fontColour: string;
  bgColour: string;
  updateTempFontColour: (fontColour: string) => void;
  updateTempBgColour: (bgColour: string) => void
};

const ColourRadioSet = ({ fontColour, bgColour, updateTempFontColour, updateTempBgColour }: ColourRadioSetProps) => {
  const handleColoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedColours = JSON.parse(event.target.value)
    const selectedFontColour = selectedColours.fontColour;
    const selectedBgColour = selectedColours.bgColour;
    updateTempFontColour(selectedFontColour)
    updateTempBgColour(selectedBgColour);
  };

  return (
      <div className="govuk-radios" data-module="govuk-radios">
        <label className="form__label--radio" style={{ backgroundColor: '#f1f0f0' }}>
          <input
            onChange={handleColoursChange}
            value='{"fontColour": "#000000", "bgColour": "#FFFFFF"}'
            className="form__radio"
            name="color-pref"
            type="radio"
            checked={fontColour === "#000000" && bgColour === "#FFFFFF"}
            style={{ width: '1.1875rem', height: '1.1875rem' }}
          />
          Standard
        </label>
        <label className="form__label--radio" style={{ backgroundColor: '#000', color: '#ff0' }}>
          <input
            onChange={handleColoursChange}
            value='{"fontColour": "#FF0", "bgColour": "#000"}'
            className="form__radio"
            name="color-pref"
            type="radio"
            checked={fontColour === "#FF0" && bgColour === "#000"}
            style={{ width: '1.1875rem', height: '1.1875rem' }}
          />
          High contrast
        </label>
        <label className="form__label--radio" style={{ backgroundColor: '#fff9d2' }}>
          <input
            onChange={handleColoursChange}
            value='{"fontColour": "#000000", "bgColour": "#fff9d2"}'
            className="form__radio"
            name="color-pref"
            type="radio"
            checked={fontColour === "#000000" && bgColour === "#fff9d2"}
            style={{ width: '1.1875rem', height: '1.1875rem' }}
          />
          Cream
        </label>
        <label className="form__label--radio" style={{ backgroundColor: '#9fcfff' }}>
          <input
            onChange={handleColoursChange}
            value='{"fontColour": "#000000", "bgColour": "#9fcfff"}'
            className="form__radio"
            name="color-pref"
            type="radio"
            checked={fontColour === "#000000" && bgColour === "#9fcfff"}
            style={{ width: '1.1875rem', height: '1.1875rem' }}
          />
          Blue
        </label>
      </div>
  );
};

export default ColourRadioSet;