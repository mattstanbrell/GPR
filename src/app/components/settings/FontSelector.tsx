type FontSelectorProps = {
  font: string;
  updateTempFont: (font: string) => void;
};

const FontSelector = ({ font, updateTempFont }: FontSelectorProps) => {

  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFont = event.target.value;
    updateTempFont(selectedFont);
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className="form__control">
      <label className="govuk-label">Font</label>
      <select style={{ width: "min(700px, 60%)" }} className="govuk-select" value={font} onChange={handleFontChange}>
        <option value="lexend">Lexend (Standard)</option>
        <option value="times">Times</option>
        <option value="courier">Courier</option>
        <option value="arial">Arial</option>
      </select>
    </div>
  );
};

export default FontSelector;