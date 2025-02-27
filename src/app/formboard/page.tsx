import { redirect } from "next/navigation";
import SocialeWorkerFormboard from "@/app/components/formboard/SocialWorkerFormboard";
import ManagerFormboard from "@/app/components/formboard/ManagerFormboard";
import { PERMISSION_GROUP } from "@/app/constants/enum";
import { HOME } from "@/app/constants/urls";

function renderFormboard(permissionGroup: string) {
	switch (permissionGroup) {
		case PERMISSION_GROUP.SOCIAL_WORKER:
			return <SocialeWorkerFormboard />;
		case PERMISSION_GROUP.MANAGER:
			return <ManagerFormboard />;
		default:
			redirect(HOME);         // maybe redirect with a message to be displayed on home page
	}
}

const Formboard = async () => {
    const dummy = PERMISSION_GROUP.SOCIAL_WORKER;

	return (
		<div>
			{ renderFormboard(dummy) }
		</div>
	)
}

export default Formboard;