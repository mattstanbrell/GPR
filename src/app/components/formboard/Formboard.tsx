
'use client'

import Image from 'next/image';
import FormboardTable from "@/app/components/formboard/FormboardTable";
import { type User } from '@/app/types/models';

const FormboardHeader = ({boardTitle, handleIndex} : {boardTitle: string, handleIndex: (isIncrement: boolean) => void}) => {
    return (
        <div className="w-full p-2 flex  text-center font-bold text-xl">
            <div className='md:w-0 md:invisible xs:sm:visible cursor-pointer' onClick={() => handleIndex(false)}>
                <NavigationButton src="/previous.svg" alt="picture of a circle with a left arrow" />
            </div>
            <h2 className='w-full text-[var(--color-background-dark)]'>{ boardTitle }</h2>
            <div className='md:invisible xs:sm:visible md:w-0 cursor-pointer' onClick={() => handleIndex(true)}>
                <NavigationButton src="/next.svg" alt="picture of a circle with a right arrow" />
            </div>
        </div>
    )
}

const NavigationButton = ({src, alt} : {src: string, alt: string}) => {
    return (
        <Image src={ src } alt={ alt } width={ 40 } height={ 40 } style={{ filter: "var(--hounslow-primary-filter)" }}/>
    )
}

const FormboardTable = ({boardTitle, boardForms} : {boardTitle: string, boardForms: Array<User>}) => {
    return (
        <div className="h-[90%] p-3 bg-[var(--color-background-light)] drop-shadow-[0_4px_4px__rgba(0,0,0,0.75)] rounded-[16px]"> 
            <FormboardTable boardTitle={ boardTitle } boardForms={ boardForms }/>
        </div>
    )
}

const Formboard = ({ boardTitle, boardForms, handleIndex }: { boardTitle: string, boardForms: Array<any>, handleIndex: (isIncrement: boolean) => void }) => {
    return (
        <>
            <FormboardHeader boardTitle={ boardTitle } handleIndex={ handleIndex } />
            <FormboardTable boardTitle={ boardTitle } boardForms={ boardForms }
        </>
    )
}

export default Formboard;