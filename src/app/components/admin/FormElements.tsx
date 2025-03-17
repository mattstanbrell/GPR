
import DatePicker from "react-datepicker";

export const InputTextTableRow = (
    {fieldName, inputName, isRequired = false, defaultValue} : 
    {fieldName: string, inputName: string, isRequired?: boolean, defaultValue: string }) => {
    return (
        <tr>
            <td>{ fieldName }</td>
            <td><input name={ inputName } type="text" defaultValue={ defaultValue } required={ isRequired } /></td>
        </tr>
    )
}

export const InputDateTableRow = (
    {fieldName, inputName, isRequired = false, defaultValue} : 
    {fieldName: string, inputName: string, isRequired?: boolean, defaultValue: string | null }) => {
    
    const today = new Date(); 
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    if (defaultValue) {
        [year, month, day] = defaultValue.split('-').map(Number);
    }

    const InputDay = () => {return <input name="dd" type="number" placeholder="DD" defaultValue={day} min={1} max={31}  ></input> }; 
    const InputMonth = () => {return <input name="mm" type="number" placeholder="MM" defaultValue={month} min={1} max={12} ></input> }; 
    const InputYear = () => {return <input name="yyyy" type="number" placeholder="YYYY" defaultValue={year} min={1970} max={3000}></input> }; 
    return (
        <tr>
            <td>{ fieldName }</td>
            <td><InputDay /><InputMonth /><InputYear /></td>
        </tr> 
    )
}

export const InputSelectTableRow = (
    {fieldName, inputName, defaultValue, options} : 
    {fieldName: string, inputName: string, defaultValue: string, options: string[]}
) => {
    return (
        <tr>
            <td>{ fieldName }</td>
            <td>
                <select name={ inputName } defaultValue={ defaultValue }>
                    <option value="" disabled>Select</option>
                    <>
                    { 
                        options.map((opt, index) => {
                            return <option key={index} value={ opt }>{ opt }</option>
                        })
                    } 
                    </>
                </select>
            </td>
        </tr>
    )
}