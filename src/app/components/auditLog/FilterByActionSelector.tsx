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
    <div className="form__control items-center md:gap-3 mb-1 flex-1">
      <label className="govuk-label">Action:</label>
      <select className="govuk-select" value={action} onChange={handleActionChange}>
        <option value="ALL">ALL</option>
        <option value="submitted">submitted</option>
        <option value="approved">approved</option>
        <option value="denied">denied</option>
      </select>
    </div>
  );
};

export default FilterByActionSelector;