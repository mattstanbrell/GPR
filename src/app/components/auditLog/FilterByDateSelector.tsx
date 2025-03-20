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
    <div className="form__control items-center md:gap-3 mb-1 flex-1">
      <label className="govuk-label">Select Date:</label>
      <div className="md:flex flex-wrap items-center">
        <DatePicker
          selected={selectedDate}
          onChange={updateDate}
          filterDate={isDateValid}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select a date"
          className="govuk-select w-32"
          wrapperClassName="date-picker-wrapper"
        />
        <button
          type="button"
          onClick={() => updateDate(null)}
          className="govuk-button govuk-button--secondary"
          style={{
            marginBottom: '2px',
            cursor: 'pointer',
            width: '6em',
            height: '2em'
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default FilterByDateSelector;