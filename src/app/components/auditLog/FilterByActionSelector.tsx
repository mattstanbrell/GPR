type FilterByActionSelectorProps = {
  action: string;
  updateAction: (action: string) => void;
};

const FilterByActionSelector = ({ action, updateAction }: FilterByActionSelectorProps) => {

  const handleActionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAction = event.target.value;
    updateAction(selectedAction);
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className="form__control">
      <label className="govuk-label">Action</label>
      <select style={{ width: "min(700px, 60%)" }} className="govuk-select" value={action} onChange={handleActionChange}>
        <option value="ALL">ALL</option>
        <option value="submitted">submitted</option>
        <option value="approved">approved</option>
        <option value="denied">denied</option>
      </select>
    </div>
  );
};

export default FilterByActionSelector;