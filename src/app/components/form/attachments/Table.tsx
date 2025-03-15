'use client'

import { Receipt } from "@/app/types/models";
import { AttachmentIcon, OptionsIcon } from "@/app/components/form/attachments/Icons"

const TableRow = ({name, handleOptions} : {name: string, handleOptions: () => void}) => {
    return (
        <tr className="border-solid border-1 border-black">
            <td><AttachmentIcon /></td>
            <td>{ name }</td>
            <td><OptionsIcon onClick={ handleOptions } /> </td>
        </tr>   
    )
}

export const Table = (
    {uploadedReceiptNames, handleOptions} : 
    {uploadedReceiptNames: string[], handleOptions: () => void}
) => {
    return (
        <table className="w-full">
            <tbody>
                {uploadedReceiptNames.map((name, index) => (
                    <TableRow name={ name } handleOptions={ handleOptions } />
                ))}
            </tbody>
        </table>
    )
    
};