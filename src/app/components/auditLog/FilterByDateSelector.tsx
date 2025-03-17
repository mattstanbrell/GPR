import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type FilterByDateSelectorProps = {
  logDatesSet: Date[];
  selectedDate: Date | null;
  updateDate: (date: Date | null) => void;
};

const FilterByDateSelector = ({ logDatesSet, selectedDate, updateDate}: FilterByDateSelectorProps) => {

  const isDateValid = (date: Date) => {
    return logDatesSet.some((validDate) => validDate.toISOString().split("T")[0] === date.toISOString().split("T")[0]);
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className="form__control">
      <label className="govuk-label">Select Date</label>
      <DatePicker
        selected={selectedDate}
        onChange={updateDate}
        filterDate={isDateValid}
        dateFormat="yyyy-MM-dd"
        placeholderText="Select a date"
        className="govuk-select"
        wrapperClassName="date-picker-wrapper"
      />
      <button
        type="button"
        onClick={() => updateDate(null)}
        className="govuk-button govuk-button--secondary"
        style={{ marginLeft: "10px" }}
      >
        Clear Date
      </button>
    </div>
  );
};

export default FilterByDateSelector;