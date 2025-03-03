
import StatusIcon from '@/app/components/form/Icons'
import { redirect } from 'next/navigation';
import { type Schema } from '../../../../amplify/data/resource'


const getTableHeader = (boardTitle: string) => {
    return (
        <div className='flex h-1/10 bg-[var(--color-background-medium)] text-white font-bold rounded-t-[8px]'>
            <h3 className="w-1/4 p-2 pr-0">Form</h3>
            <h3 className="w-3/4 p-2 pl-0 text-right">{ boardTitle }</h3>
        </div>
    )
}

const getTableBody = (boardForms: Array<any>) => {
    return (
        <tbody>
            {boardForms && boardForms.length > 0 ? (
                boardForms.map((record, index) => {
                    const fullName = `${ record.firstName } ${ record.lastName }`
                    
                    return (
                    <tr key={ index } onClick={() => redirect(`/${ record.id }`)} className='h-8 border-2 border-dotted border-transparent border-b-black cursor-pointer hover:bg-[var(--color-background-light)]' title={ fullName }>
                        <td className='flex p-2 text-clip text-nowrap overflow-hidden'><StatusIcon formStatus={ record.status } /> <p className='pl-1'>{ fullName }</p></td>
                        <td className='p-2 text-right'>{ record.date }</td>
                    </tr>
                )})
            ) : (
                <tr className='text-center'>
                    <td colSpan={2} className='p-2'>No forms to display.</td>
                </tr>
            )}
        </tbody>
    )
}

const FormboardTable = ({boardTitle, boardForms} : {boardTitle: string, boardForms: Array<any>}) => {
    return (
        <>
            { getTableHeader(boardTitle) }
            <div className='h-9/10 bg-white overflow-scroll rounded-b-[8px]'>
                <table className="w-full text-left">
                    { getTableBody(boardForms) }
                </table>
            </div>
        </>
    )
}

export default FormboardTable;