
import React from "react"

const TableCell = (
    {colspan = 1, style = "", data} : 
    {colspan?: number, style?: string, data: string | React.ReactNode}
) => {
    return <td colSpan={ colspan } className={`${style}`}>{ data }</td>
}

const TableTitleCell = ({ data } : { data: string }) => {
    return <td className="font-bold">{ data }</td>
}

const FormInputString = ({name, defaultValue} : {name: string, defaultValue: string}) => {
    return <input name={ name } type="text" defaultValue={ defaultValue } />
}

const FormInputNumber = (
    {name, defaultValue, step = 1} : 
    {name: string, defaultValue: number, step?: number}
) => {
    return <input 
            name={ name } 
            type="number" 
            defaultValue={ defaultValue } 
            min="0" 
            step={ step } 
        />
}

const Table = ({receiptData} : {receiptData: ReceiptData}) => {
    return (
        <table>
            <tbody>
                <tr>
                    <TableCell colspan={2} style="text-right" data="Total £" />
                    <TableCell data={ 
                        <FormInputNumber 
                            name="total"
                            defaultValue={ receiptData ? receiptData.total : 0.00 } 
                            step={ 0.01 }
                        /> } 
                    />
                </tr>
                <tr>
                    <TableTitleCell data="Item Name" />
                    <TableTitleCell data="No." />
                    <TableTitleCell data="Cost" />
                </tr>
                {receiptData && receiptData.items && receiptData.items.map(({ name, quantity, cost}, index) => (
                    <tr key={ index }>
                        <TableCell data = { 
                            <FormInputString 
                                name={`items[${index}].name`} 
                                defaultValue={ name ? name : "" } 
                            /> }
                        /> 
                        <TableCell data = { 
                            <FormInputNumber 
                                name={`items[${index}].quantity`} 
                                defaultValue={ quantity ? quantity : 0 } 
                            /> }
                        /> 
                        <TableCell data = { 
                            <FormInputNumber 
                                name={`items[${index}].cost`} 
                                defaultValue={ cost ? cost : 0.00 } 
                                step={ 0.01 }
                            /> }
                        /> 
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default Table;