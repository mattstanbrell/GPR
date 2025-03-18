import { data } from "../../../../amplify/data/resource"

export const HeaderTableData = ({data} : {data: string}) => {
    return <th className="govuk-table__header">{ data }</th>
}

export const TableData = ({data, colspan = 1} : {data: string | React.ReactElement, colspan?: number}) => {
    return <td className="govuk-table__cell" colSpan={ colspan }>{ data }</td>
}