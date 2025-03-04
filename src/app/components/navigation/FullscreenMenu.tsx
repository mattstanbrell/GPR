
import { getMenuItems } from '@/app/components/navigation/_helpers'

const FullscreenMenu = ({handleToggle, handleClick} : {handleToggle: () => void, handleClick: () => {}}) => {

    const userGroup = '';
    const isTitled = true;
    const menuItems = getMenuItems(userGroup, isTitled, handleClick);

    return (
        <div className="size-full p-5 bg-[var(--hounslow-primary)] flex justify-center text-white font-bold text-3xl"> 
            <table className="w-[60%] mt-[8vh] max-h-3/5 min-h-2/5 text-white">
                <tbody>
                    {menuItems.map((item, index) => (
                        <tr key={ index } onClick={handleToggle}>
                            <td className="align-top">
                                { item }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default FullscreenMenu;