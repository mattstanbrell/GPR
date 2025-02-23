export default function AuditLogClient() {
  return (
    <table className="govuk-table">
      <caption className="govuk-table__caption govuk-table__caption--xl">Audit Log</caption>
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th scope="col" className="govuk-table__header">Action</th>
          <th scope="col" className="govuk-table__header">Date</th>
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        <tr className="govuk-table__row">
          <th scope="row" className="govuk-table__header">John Doe approved a form</th>
          <td className="govuk-table__cell">Today at 14:03</td>
        </tr>
        <tr className="govuk-table__row">
          <th scope="row" className="govuk-table__header">Jane Doe submitted a form</th>
          <td className="govuk-table__cell">Yesterday at 12:47</td>
        </tr>
      </tbody>
    </table>
  );
}