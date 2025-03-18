
import DatePicker from "react-datepicker";
import { TableData } from "@/app/components/admin//TableComponents";

export const InputTextTableRow = (
    {fieldName, inputName, isRequired = false, defaultValue, placeholder = ""} : 
    {
        fieldName: string, 
        inputName: string, 
        isRequired?: boolean, 
        defaultValue: string, 
        placeholder?: string 
    }
) => {
    return (
        <tr className="govuk-table__row">
            <TableData data={fieldName} /> 
            <TableData data={
                <input className="govuk-input" 
                    name={ inputName } 
                    type="text" 
                    defaultValue={ defaultValue } 
                    required={ isRequired } 
                    placeholder={ placeholder }
                />
            } />
        </tr>
    )
}

export const InputDateTableRow = (
    {fieldName, defaultValue} : 
    {fieldName: string, defaultValue: string | null }) => {
    
    const today = new Date(); 
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    if (defaultValue) {
        [year, month, day] = defaultValue.split('-').map(Number);
    }

    const InputDay = () => {return <input className="govuk-input govuk-date-input__input govuk-input--width-2 mr-2" name="dd" type="number" placeholder="DD" defaultValue={day} min={1} max={31}  ></input> }; 
    const InputMonth = () => {return <input className="govuk-input govuk-date-input__input govuk-input--width-2 mr-2" name="mm" type="number" placeholder="MM" defaultValue={month} min={1} max={12} ></input> }; 
    const InputYear = () => {return <input className="govuk-input govuk-date-input__input govuk-input--width-4" name="yyyy" type="number" placeholder="YYYY" defaultValue={year} min={1970} max={3000}></input> }; 
    return (
        <tr className="govuk-table__row">
            <TableData data={fieldName} />
            <TableData data={<><InputDay /><InputMonth /><InputYear /></>} />
        </tr> 
    )
}

export const InputSelectTableRow = (
    {fieldName, inputName, defaultValue, options} : 
    {fieldName: string, inputName: string, defaultValue: string, options: string[]}
) => {
    return (
        <tr className="govuk-table__row">
            <TableData data={ fieldName } /> 
            <td className="govuk-table__cell">
                <select className="govuk-select" name={ inputName } defaultValue={ defaultValue }>
                    <option value="" disabled>Select</option>
                    { options.map((opt, index) => (
                        <option key={index} value={ opt }>{ opt }</option>
                    ))} 
                </select>
            </td>
        </tr>
    )
}

export const InputHiddenTableRow = ({name, value} : {name: string, value: string}) => {
    return <tr className="hidden"><td className="hidden"><input name={name} value={ value } readOnly /></td></tr>
}