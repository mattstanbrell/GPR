
'use client'

import FormboardTable from "@/app/components/formboard/FormboardTable";

const Formboard = ({ boardTitle, boardForms }: { boardTitle: string, boardForms: Array<any> }) => {
    return (
        <div className="md:w-full sm:w-[95%] m-2 md:first:ml-0 md:last:mr-0">
            <div className="text-center font-bold text-xl">
                <h2>{ boardTitle }</h2>
            </div>
            <div className="h-128 p-2 bg-gray-500 drop-shadow-[0_4px_4px__rgba(0,0,0,0.75)] overflow"> 
                <FormboardTable boardTitle={ boardTitle } boardForms={ boardForms }/>
            </div>
        </div>
    )
}

export default Formboard;