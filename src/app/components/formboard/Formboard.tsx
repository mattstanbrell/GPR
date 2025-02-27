
'use client'

import Image from 'next/image';
import FormboardTable from "@/app/components/formboard/FormboardTable";
import Link from 'next/link';

const Formboard = ({ boardTitle, boardForms, handleIndex }: { boardTitle: string, boardForms: Array<any>, handleIndex: Function }) => {
    return (
        <div className="md:w-full sm:w-[95%] m-2">
            <div className="flex w-full p-2 text-center font-bold text-xl">
                <div className='md:invisible xs:sm:visible md:w-0 cursor-pointer' onClick={() => handleIndex(true)}>
                    <Image src="/previous.svg" alt="" width={ 40 } height={ 40 }/>
                </div>
                <h2 className='w-full'>{ boardTitle }</h2>
                <div className='md:invisible xs:sm:visible md:w-0 cursor-pointer' onClick={() => handleIndex(false)}>
                    <Image src="/next.svg" alt="" width={ 40 } height={ 40 }/>
                </div>
            </div>
            <div className="h-128 p-2 bg-[var(--formboard-primary)] drop-shadow-[0_4px_4px__rgba(0,0,0,0.75)] overflow"> 
                <FormboardTable boardTitle={ boardTitle } boardForms={ boardForms }/>
            </div>
        </div>
    )
}

export default Formboard;