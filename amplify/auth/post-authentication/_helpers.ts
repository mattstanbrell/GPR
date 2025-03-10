
import { ADMIN_GROUP_ID, MANAGER_GROUP_ID, SOCIAL_WORKER_GROUP_ID,
	ADMIN_GROUP, MANAGER_GROUP, SOCIAL_WORKER_GROUP } from "./constants"

export const getPermissionGroup = (OIDCGroupIds: string[]) => {
    if (OIDCGroupIds.includes(ADMIN_GROUP_ID)) {
        return ADMIN_GROUP
    } else if (OIDCGroupIds.includes(MANAGER_GROUP_ID)) {
        return MANAGER_GROUP
    } else if (OIDCGroupIds.includes(SOCIAL_WORKER_GROUP_ID)) {
        return SOCIAL_WORKER_GROUP
    } else {
        return SOCIAL_WORKER_GROUP	// assign the least permission group
    }
}