
'use client'

import { redirect } from "next/navigation";
import SocialeWorkerFormboard from "@/app/components/formboard/SocialWorkerFormboard";
import ManagerFormboard from "@/app/components/formboard/ManagerFormboard";
import { PERMISSIONS } from "@/app/constants/models";
import { HOME } from "@/app/constants/urls";
import { useUserModel } from "@/utils/authenticationUtils"
import { PermissionsGroup, User } from "@/app/types/models";

function renderFormboard(permissionGroup: PermissionsGroup, userModel: User) {
	switch (permissionGroup) {
		case PERMISSIONS.SOCIAL_WORKER_GROUP:
			return <SocialeWorkerFormboard userModel={ userModel }/>;
		case PERMISSIONS.MANAGER_GROUP:
			return <ManagerFormboard userModel={ userModel } />;
		default:
			redirect(HOME)
	}
}

const Formboard = () => {
    const userModel = useUserModel();
	const permissionGroup = userModel?.permissionGroup
	
	return (
		<div className="h-120 xs:sm:h-40 md:flex justify-center">
			{ permissionGroup ? renderFormboard(permissionGroup, userModel) : <h3>Loading...</h3> }
		</div>
	)
}

export default Formboard;