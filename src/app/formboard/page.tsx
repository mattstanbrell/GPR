import { redirect } from "next/navigation";
import SocialeWorkerFormboard from "@/app/components/formboard/SocialWorkerFormboard";
import ManagerFormboard from "@/app/components/formboard/ManagerFormboard";
import { PERMISSIONS } from "@/app/constants/models";
import { HOME } from "@/app/constants/urls";

function renderFormboard(permissionGroup: string) {
	switch (permissionGroup) {
		case PERMISSIONS.SOCIAL_WORKER_GROUP:
			return <SocialeWorkerFormboard />;
		case PERMISSIONS.MANAGER_GROUP:
			return <ManagerFormboard />;
		default:
			redirect(HOME);         // maybe redirect with a message to be displayed on home page
	}
}

const Formboard = async () => {
    const dummy = PERMISSIONS.SOCIAL_WORKER_GROUP;

	return (
		<div className="h-120 xs:sm:h-40 md:flex justify-center">
			{ renderFormboard(dummy) }
		</div>
	)
}

export default Formboard;