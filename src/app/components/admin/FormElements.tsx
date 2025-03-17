
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
    {fieldName: string, inputName: string, isRequired?: boolean, defaultValue: Date }) => {
    return (
        <tr>
            <td>{ fieldName }</td>
            <td><DatePicker selected={ defaultValue } /></td>
        </tr>
    )
}

export const InputSelectTableRow = (
    {fieldName, inputName, defaultValue, options} : 
    {fieldName: string, inputName: string, defaultValue: string, options: string[]}
) => {
    console.log(options)
    return (
        <tr>
            <td>{ fieldName }</td>
            <td>
                <select name={ inputName }>
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