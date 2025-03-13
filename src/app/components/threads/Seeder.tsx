import { useUserModel } from "@/utils/authenticationUtils";
import { PrimaryButton } from "../util/Button";
import { seed, displayBackend, deleteModels } from "./dummy";



const Seeder = () => {
    const currentUser = useUserModel();
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