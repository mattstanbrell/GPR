
'use client'

import FormboardTable from "@/app/components/formboard/FormboardTable";

const Formboard = ({ boardTitle, boardForms }: { boardTitle: string, boardForms: Array<any> }) => {
    return (
        <div className="md:w-1/4 sm:w-full sm:h-[70vh]">
            <div className="text-center font-bold text-xl">
                <h2>{ boardTitle }</h2>
            </div>
            <div className="h-[70vh] p-[8px] bg-gray-500 rounded-lg"> 
                <FormboardTable boardTitle={ boardTitle } boardForms={ boardForms }/>
            </div>
        </div>
    )
}

export default Formboard;