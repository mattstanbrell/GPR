
import StatusIcon from '@/app/components/form/Icons'
import { redirect } from 'next/navigation';

const FormboardTable = ({boardTitle, boardForms} : {boardTitle: string, boardForms: Array<any>}) => {
    return (
        <div className='size-full bg-[var(--formboard-secondary)] align-middle'>
        <table className="w-full text-left border-collapse border-spacing-0 border-none">
            <thead className="h-8 bg-[var(--formboard-table-header-colour)]">
                <tr>
                    <th className="w-full pl-2 pr-2">Form</th>
                    <th className="w-1/5 pl-2 pr-2">{ boardTitle }</th>
                </tr>
            </thead>
            <tbody>
                {boardForms && boardForms.length > 0 ? (
                    boardForms.map((record, index) => (
                        <tr key={ index } onClick={() => redirect(`/${record.id}`)} className='h-8 cursor-pointer border-2 border-dotted border-transparent border-b-black '>
                            <td className='w-full flex p-2 text-clip text-nowrap overflow-hidden'><StatusIcon formStatus={ record.status } /> <p className='pl-1'>{ record.firstName } { record.lastName }</p></td>
                            <td className='p-2'>{ record.date }</td>
                        </tr>
                    ))
                ) : (
                    <tr className='size-full text-center'>
                        <td colSpan={2} className='p-2'>No forms to display.</td>
                    </tr>
                )}
            </tbody>
        </table>
        </div>
    )
}

export default FormboardTable;