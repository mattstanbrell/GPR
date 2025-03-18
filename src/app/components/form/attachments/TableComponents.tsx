'use client'

import { DeleteIcon, DownloadIcon } from "@/app/components/form/attachments/Icons"

export const TableHeader = () => {
    return (
        <thead className="govuk-table__head">
            <tr className="govuk-table__row">
                <th className="govuk-table__header">Name</th>
                <th className="govuk-table__header" colSpan={ 2 }>Options</th>
            </tr>
        </thead>
    )
}

export const TableBody = (
    {receiptNames, handleDownload, handleDelete} : 
    {receiptNames: string[], handleDownload: (index: number) => void, handleDelete: (index: number) => void}
) => {
    return (
        <tbody>
            {receiptNames.map((name, index) => (
                <TableRow 
                    key={index}
                    name={ name } 
                    handleDownload={ handleDownload } 
                    handleDelete={ handleDelete } 
                    index={ index } 
                />
            ))}
        </tbody>
    )
}

export const TableRow = (
    {name, handleDownload, handleDelete, index} : 
    {   name: string, 
        handleDownload: (index: number) => void, 
        handleDelete: (index: number) => void, 
        index: number
    }
) => {

    const tableDataStyle = "md:w-1/12 p-2 truncate govuk-table__cell"

    return (
        <tr key={ index } className="govuk-table__row">
            <td className={`md:w-auto ${tableDataStyle}`}>{ name }</td>
            <td title="Download" className={`${tableDataStyle}`} onClick={() => handleDownload(index)}><DownloadIcon /></td>
            <td title="Delete" className={`${tableDataStyle}`} onClick={() => handleDelete(index)}><DeleteIcon /></td>
        </tr>   
    )
}