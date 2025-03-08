
import { Context, Callback, Handler } from 'aws-lambda';
import { Amplify } from 'aws-amplify';
import outputs from "../../../amplify_outputs.json";
import { getUserIdByEmail, createUser, updateUser } from '../../../src/utils/apis';

Amplify.configure(outputs);

export const handler: Handler = async (event: any, context: Context) => {
    try {
        const { userAttributes } = event.request;
        const email = userAttributes.email;
        const firstName = userAttributes.given_name || 'John';
        const lastName = userAttributes.family_name || 'Doe';
        const groups = JSON.parse(userAttributes['custom:groups'] || '[]');

        if (groups.includes('cab6488b-12e6-4d6e-bdf0-6a2d254b2ec9')) {
            const permissionGroup = 'ADMIN';
        } else if (groups.includes('0989a8d5-c347-4ce1-9d50-c97641a4d3b5')) {
            const permissionGroup = 'MANAGER';
        } else {
            const permissionGroup = 'SOCIAL_WORKER';
        }

        try {
            let id = await getUserIdByEmail(email); 
            await updateUser(id, {lastLogin: new Date().toISOString()});
        } catch (error) {
            createUser(email, firstName, lastName)
                .then((res) => console.log(res))
                .catch((error) => console.error(error)); 
                const id = await getUserIdByEmail(email);
                await updateUser(id, {lastLogin: new Date().toISOString()});
        }
        
    } catch (error) {
        console.error('Error in postConfirmation trigger:', error);
    }
};