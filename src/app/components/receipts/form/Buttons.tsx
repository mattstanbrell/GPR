
import { useFormStatus } from "react-dom";
import Image from "next/image"

const Submit = ({style} : {style?: string}) => {
    const { pending } = useFormStatus();
    return (
        <div className={`${style}`} >
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

const AddItemTableCellButton = (
    {colspan, rowStyle, handleAddItem} : 
    {colspan: number, rowStyle: string, handleAddItem: () => void}
) => {
    return (
        <td colSpan={ colspan } 
            className={`${rowStyle} text-[var(--hounslow-primary)] text-center font-bold border-none hover:cursor-pointer`} 
            onClick={() => handleAddItem()}>
                Add item
        </td>
    )
}

export { Submit, DeleteButton, AddItemTableCellButton };
