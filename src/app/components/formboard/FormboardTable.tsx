
import StatusIcon from '@/app/components/Form/Icons'
import { redirect } from 'next/navigation';

const FormboardTable = ({boardTitle, boardForms} : {boardTitle: string, boardForms: Array<any>}) => {
    return (
        <table className="table-fixed w-full bg-white">
            <thead className="bg-gray-300 h-8">
                <tr>
                    <th className="w-3/5">Form</th>
                    <th className="w-2/5">{ boardTitle }</th>
                </tr>
            </thead>
            <tbody>
                {boardForms && boardForms.length > 0 ? (
                    boardForms.map((record, index) => (
                        <tr key={ index } onClick={() => redirect(`/${record.id}`)} className='cursor-pointer'>
                            <td><StatusIcon formStatus={ record.status } /> { record.firstName } { record.lastName }</td>
                            <td>{ record.date }</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={2}>No forms to display.</td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}

export default FormboardTable;