
'use client'

import Image from 'next/image';
import FormboardTable from "@/app/components/formboard/FormboardTable";
import { type Schema } from '../../../../amplify/data/resource'

const getFormboardHeader = (boardTitle: string, handleIndex: (isIncrement: boolean) => void ) => {
    return (
        <div className="w-full p-2 flex  text-center font-bold text-xl">
            <div className='md:w-0 md:invisible xs:sm:visible cursor-pointer' onClick={() => handleIndex(false)}>
                { getNavigationButton("./previous.svg", "picture of a circle with a left arrow") }
            </div>
            <h2 className='w-full text-[var(--color-background-dark)]'>{ boardTitle }</h2>
            <div className='md:invisible xs:sm:visible md:w-0 cursor-pointer' onClick={() => handleIndex(true)}>
                { getNavigationButton("./next.svg", "picture of a circle with a right arrow") }
            </div>
        </div>
    )
}

const getNavigationButton = (src: string, alt: string) => {
    return (
        <Image src={ src } alt={ alt } width={ 40 } height={ 40 } style={{ filter: "var(--hounslow-primary-filter)" }}/>
    )
}

const getFormboardTable = (boardTitle: string, boardForms: Array<any>) => {
    return (
        <div className="h-[90%] p-3 bg-[var(--color-background-light)] drop-shadow-[0_4px_4px__rgba(0,0,0,0.75)] rounded-[16px]"> 
            <FormboardTable boardTitle={ boardTitle } boardForms={ boardForms }/>
        </div>
    )
}

const Formboard = ({ boardTitle, boardForms, handleIndex }: { boardTitle: string, boardForms: Array<any>, handleIndex: (isIncrement: boolean) => void }) => {
    return (
        <>
            { getFormboardHeader(boardTitle, handleIndex) }
            { getFormboardTable(boardTitle, boardForms) }
        </>
    )
}

export default Formboard;