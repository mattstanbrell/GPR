'use client'

import { Receipt } from "@/app/types/models";
import { AttachmentIcon, DeleteIcon, DownloadIcon } from "@/app/components/form/attachments/Icons"

const TableRow = (
    {name, handleDownload, handleDelete, index} : 
    {   name: string, 
        handleDownload: (index: number) => void, 
        handleDelete: (index: number) => void, 
        index: number
    }
) => {
    return (
        <tr key={ index } className="border-solid border-1 border-black">
            <td><AttachmentIcon /></td>
            <td>{ name }</td>
            <td onClick={() => handleDownload(index)}><DownloadIcon /></td>
            <td onClick={() => handleDelete(index)}><DeleteIcon /></td>
        </tr>   
    )
}

export const Table = (
    {uploadedReceiptNames, handleDownload, handleDelete} : 
    {uploadedReceiptNames: string[], handleDownload: (index: number) => void, handleDelete: (index: number) => void}
) => {
    return (
        <table className="w-full">
            <tbody>
                {uploadedReceiptNames.map((name, index) => (
                    <TableRow 
                        name={ name } 
                        handleDownload={ handleDownload } 
                        handleDelete={ handleDelete } 
                        index={ index } 
                    />
                ))}
            </tbody>
        </table>
    )
    
};