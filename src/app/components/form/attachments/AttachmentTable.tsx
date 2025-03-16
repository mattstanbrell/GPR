
'use client'

import { TableHeader, TableBody } from "@/app/components/form/attachments/TableComponents"

export const AttachmentTable = (
    {receiptNames, handleDownload, handleDelete} : 
    {receiptNames: string[], handleDownload: (index: number) => void, handleDelete: (index: number) => void}
) => {
    return (
        <table className="max-h-[80vh] w-full mb-4 govuk-table">
            <TableHeader /> 
            <TableBody receiptNames={receiptNames} handleDownload={ handleDownload } handleDelete={ handleDelete } /> 
        </table>
    )
};