import { AppContext } from "@/app/layout";
import { useContext } from "react";
import { PrimaryButton } from "../util/Button";
import { seed, displayBackend, deleteModels } from "./dummy";



const Seeder = () => {
    const { currentUser } = useContext(AppContext);
    return (
        <div>
            { currentUser ?
                <div className="flex flex-row h-10 justify-center">
                    <PrimaryButton title="seed" onClick={() => seed(currentUser)} />
                    <PrimaryButton title="display" onClick={() => displayBackend()} />
                    <PrimaryButton title="delete" onClick={() => deleteModels(currentUser)} />
                </div> : null
            }
        </div>
    )
}

export default Seeder