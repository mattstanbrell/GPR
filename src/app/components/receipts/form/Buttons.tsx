
import { useFormStatus } from "react-dom";
import Image from "next/image"

const Submit = () => {
    const { pending } = useFormStatus();
    return (
        <div className="flex justify-center">
            <button type="submit" className="h-[5vh] w-30 mt-10 rounded-[8px] text-white bg-[var(--hounslow-primary)] hover:cursor-pointer" disabled={ pending } >
                { !(pending) ? "Save" : "Saving..." }
            </button>
        </div>
    )
}


const DeleteButton = (
    {handleDeleteItem, index} : 
    {handleDeleteItem: (index: number) => void, index: number}
) => {
    return (
        <div title="Delete" className="flex justify-center hover:cursor-pointer" onClick={() => handleDeleteItem(index)}>
            <Image src="/delete.svg" alt="" width={ 20 } height={ 20 } />
        </div>
    )
}

export { Submit, DeleteButton };
