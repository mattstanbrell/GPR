type SpacingSelectorProps = {
  spacing: number;
  updateTempSpacing: (spacing: number) => void;
};

const SpacingSelector = ({ spacing, updateTempSpacing }: SpacingSelectorProps) => {

  const handleSpacingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSpacing = parseInt(event.target.value);
    updateTempSpacing(selectedSpacing);
  };

  return (
    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}} className="form__control">
    <label className="govuk-label">Letter spacing</label>
    <select style={{width: "min(700px, 60%)"}} className="govuk-select" value={spacing} onChange={handleSpacingChange}>
      <option value={0}>0 (Standard)</option>
      <option value={1}>+1</option>
      <option value={2}>+2</option>
      <option value={3}>+3</option>
    </select>
  </div>
  );
};

export default SpacingSelector;