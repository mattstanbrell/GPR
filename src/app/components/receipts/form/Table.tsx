
import React from "react"
import { DeleteButton } from "@/app/components/receipts/form/Buttons"
import { InputString, InputNumber } from "@/app/components/receipts/form/FormComponents";

const tableRowStyling = "h-[5vh] border-b-1 border-dashed";

const TableCell = (
    {colspan = 1, style = "", data} : 
    {colspan?: number, style?: string, data: string | React.ReactNode}
) => {
    return <td colSpan={ colspan } className={`p-2 ${style}`}>{ data }</td>
}

const TableTitleCell = ({ colspan = 1, data } : { colspan?: number, data: string }) => {
    return <td colSpan={ colspan } className="p-2 font-bold">{ data }</td>
}

const Table = ({receiptData, handleAddItem, handleDeleteItem} : {receiptData: ReceiptData, handleAddItem: () => void, handleDeleteItem: (index: number) => void}) => {
    return (
        <table className="md:w-full">
            <tbody>
                <tr className={`${tableRowStyling} font-bold text-xl text-[var(--hounslow-primary)]`}>
                    <TableCell colspan={2} style="text-right" data="Total £" />
                    <TableCell data={ 
                        <InputNumber 
                            name="total"
                            defaultValue={ receiptData ? receiptData.total : 0.00 } 
                            step={ 0.01 }
                        /> } 
                    />
                </tr>
                <tr className={`${tableRowStyling} bg-[var(--hounslow-primary)] text-white`}>
                    <TableTitleCell data="Item" />
                    <TableTitleCell data="No." />
                    <TableTitleCell colspan={ 2 } data="Cost £" />
                </tr>
                {receiptData && receiptData.items && receiptData.items.map(({ name, quantity, cost}, index) => (
                    <tr key={ index } title={ name } className={`${tableRowStyling}`}>
                        <TableCell style="md:w-1/2" data = { 
                            <InputString 
                                name={`items[${index}].name`} 
                                defaultValue={ name ? name : "" } 
                            /> }
                        /> 
                        <TableCell style="md:w-1/5" data = { 
                            <InputNumber 
                                name={`items[${index}].quantity`} 
                                defaultValue={ quantity ? quantity : 0 } 
                            /> }
                        /> 
                        <TableCell style="md:w-1/5" data = { 
                            <InputNumber 
                                name={`items[${index}].cost`} 
                                defaultValue={ cost ? cost : 0.00 } 
                                step={ 0.01 }
                            /> }
                        /> 
                        <td className="w-1/10">
                            <DeleteButton handleDeleteItem={ handleDeleteItem } index={ index }/>
                        </td>
                    </tr>
                ))}
                <tr>
                    <td colSpan={ 4 } className={`${tableRowStyling} text-[var(--hounslow-primary)] text-center font-bold border-none hover:cursor-pointer`} onClick={() => handleAddItem()}>Add item</td>
                </tr>
            </tbody>
        </table>
    )
}

export default Table;