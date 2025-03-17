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
    <div className="form__control flex justify-between items-center md:gap-3">
      <label className="govuk-label">Select Date</label>
      <div className="flex items-center">
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
        style={{marginBottom: 2}}
      >
        Clear
      </button>
      </div>
    </div>
  );
};

export default FilterByDateSelector;
/*
      className="govuk-select text-sm md:text-base py-1 md:py-2 w-32 md:w-auto" // Adjust size for mobile

      className="govuk-button govuk-button--secondary text-sm md:text-base py-1 md:py-2 px-2 md:px-4"

*/