import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { type Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from "$amplify/env/post-confirmation"
import { createUser, getUserIdByEmail } from '../../../src/utils/apis'

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);

Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: PostConfirmationTriggerHandler = async (event) => {
    const userAttributes = event.request.userAttributes;
    const email = userAttributes.email
    // const groups = JSON.parse(userAttributes['custom:groups])
    const firstName = "Dean"    // will need to extract first/last name 
    const lastName = "Whitbread"
  
    try {
        const user = getUserIdByEmail(email)
    } catch (error) {
        const user = createUser(email, firstName, lastName)
    }

    return event;
};