
import { PostAuthenticationTriggerHandler } from 'aws-lambda'
import { Amplify } from 'aws-amplify';
import outputs from "../../../amplify_outputs.json"
import { generateClient } from "@aws-amplify/api";
import type { Schema } from "../../data/resource";

const client = generateClient<Schema>({ authMode: "apiKey" });

Amplify.configure(outputs)

export const handler: PostAuthenticationTriggerHandler = async (event, context, callback) => {
    const { userAttributes } = event.request;
    const email = userAttributes.email;
    const firstName = userAttributes.given_name || 'John';
    const lastName = userAttributes.family_name || 'Doe';
    const groups = JSON.parse(userAttributes['custom:groups'] || '[]');

    let permissionGroup: "ADMIN" | "MANAGER" | "SOCIAL_WORKER" = 'SOCIAL_WORKER';
    if (groups.includes('cab6488b-12e6-4d6e-bdf0-6a2d254b2ec9')) {
        permissionGroup = 'ADMIN';
    } else if (groups.includes('0989a8d5-c347-4ce1-9d50-c97641a4d3b5')) {
        permissionGroup = 'MANAGER';
    }
        
    const { data, errors } = await client.models.User.list({ filter: { email: { eq: email } } });
    const modelExists = data.length !== 0

    if (errors) {
        callback(null, event)
    }

    const loginDateTime = new Date().toISOString()
    if (modelExists) {
        const userId = data[0].id; 
        const { data: updatedUser, errors} = await client.models.User.update({
            id: userId, 
            lastLogin: loginDateTime,
        });
    } else {
        const { errors, data: newUser } = await client.models.User.create({
            email: email,
            firstName: firstName,
            lastName: lastName,
            lastLogin: loginDateTime,
            permissionGroup: permissionGroup,
        })
    }

    callback(null, event)
    return event
}