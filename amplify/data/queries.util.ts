import { generateClient } from 'aws-amplify/data';
import type { Schema } from './resource';


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



export async function getUserForms(userId: string) {
    const { data, errors } = await client.models.User.get(
      { id: userId },
      { selectionSet: ['forms.*'] }
    );
  
    if (errors && errors.length > 0) {
      throw new Error(errors.map((err) => err.message).join(', '));
    }
    
    return data?.forms;
}

export async function getUserIdByEmail(email: string): Promise<string> {
    const { data, errors } = await client.models.User.list({
      filter: {
        email: { eq: email },
      },
    });
  
    if (errors && errors.length > 0) {
      throw new Error(errors.map((err) => err.message).join(', '));
    }
    if (!data || data.length === 0) {
      throw new Error(`User with email "${email}" not found.`);
    }
    return data[0].id;
}

  