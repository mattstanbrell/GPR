
'use client'

import Image from 'next/image';
import FormboardTable from "@/app/components/formboard/FormboardTable";
import { type Schema } from '../../../../amplify/data/resource'

const Formboard = ({ boardTitle, boardForms, handleIndex }: { boardTitle: string, boardForms: Array<any>, handleIndex: (isIncrement: boolean) => void }) => {
    return (
        <div className="md:w-full sm:w-[95%] m-2">
            <div className="flex w-full p-2 text-center font-bold text-xl">
                <div className='md:invisible xs:sm:visible md:w-0 cursor-pointer' onClick={() => handleIndex(true)}>
                    <Image src="/previous.svg" alt="" width={ 40 } height={ 40 } style={{ filter: "var(--hounslow-primary-filter)" }}/>
                </div>
                <h2 className='w-full text-[var(--color-background-dark)]'>{ boardTitle }</h2>
                <div className='md:invisible xs:sm:visible md:w-0 cursor-pointer' onClick={() => handleIndex(false)}>
                    <Image src="/next.svg" alt="" width={ 40 } height={ 40 } style={{ filter: "var(--hounslow-primary-filter)" }}/>
                </div>
            </div>
            <div className="h-128 p-2 bg-[var(--color-background-light)] drop-shadow-[0_4px_4px__rgba(0,0,0,0.75)] overflow"> 
                <FormboardTable boardTitle={ boardTitle } boardForms={ boardForms }/>
            </div>
        </div>
    )
}

export default Formboard;