import { generateClient } from 'aws-amplify/data';
import type { Schema } from './resource';
import { User } from 'aws-cdk-lib/aws-iam';

const client = generateClient<Schema>();

export async function createUser(user: {
    email: string;
    firstName: string;
    lastName: string;
    permissionGroup: 'ADMIN' | 'MANAGER' | 'SOCIAL_WORKER';
}) {
    const { data, errors } = await client.models.User.create(user);
    if (errors && errors.length > 0) {
        throw new Error('Error creating user: ' + errors.map((e) => e.message).join(', '));
    }
    return data;
}

export async function getUserForms(userID: string) {
    const { data, errors } = await client.models.Form.list({
      filter: {
        userID: { eq: userID },
      },
    });
    if (errors && errors.length > 0) {
      throw new Error('Error fetching forms: ' + errors.map((e) => e.message).join(', '));
    }
    return data;
  }