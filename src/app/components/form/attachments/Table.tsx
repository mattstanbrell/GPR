'use client'

import { DeleteIcon, DownloadIcon } from "@/app/components/form/attachments/Icons"

const TableRow = (
    {name, handleDownload, handleDelete, index} : 
    {   name: string, 
        handleDownload: (index: number) => void, 
        handleDelete: (index: number) => void, 
        index: number
    }
) => {

    const tableDataStyle = "w-1/12 p-2 truncate govuk-table__cell"

    return (
        <tr key={ index } className="govuk-table__row">
            <td className={`md:w-auto ${tableDataStyle}`}>{ name }</td>
            <td title="Download" className={`${tableDataStyle}`} onClick={() => handleDownload(index)}><DownloadIcon /></td>
            <td title="Delete" className={`${tableDataStyle}`} onClick={() => handleDelete(index)}><DeleteIcon /></td>
        </tr>   
    )
}

export const Table = (
    {uploadedReceiptNames, handleDownload, handleDelete} : 
    {uploadedReceiptNames: string[], handleDownload: (index: number) => void, handleDelete: (index: number) => void}
) => {
    return (
        <table className="max-h-[80vh] w-full mb-4 govuk-table">
            <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                    <th className="govuk-table__header">Attachment</th>
                    <th className="govuk-table__header" colSpan={ 2 }>Options</th>
                </tr>
            </thead>
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