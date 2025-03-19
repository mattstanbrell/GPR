type FontSizeSelectorProps = {
  fontSize: number;
  updateTempFontSize: (fontSize: number) => void;
};

const FontSizeSelector = ({ fontSize, updateTempFontSize }: FontSizeSelectorProps) => {

  const handleFontSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFontSize = parseFloat(event.target.value);
    updateTempFontSize(selectedFontSize);
  };

  return (
    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}} className="form__control">
      <label className="govuk-label">Font size</label>
      <select style={{width: "min(700px, 60%)"}} className="govuk-select" value={fontSize} onChange={handleFontSizeChange}>
        <option value={1}>+0 (Standard)</option>
        <option value={1.05}>+1</option>
        <option value={1.1}>+2</option>
        <option value={1.15}>+3</option>
      </select>
    </div>
  );
};

export default FontSizeSelector;