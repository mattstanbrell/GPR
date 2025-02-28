import { generateClient } from '@aws-amplify/api';
// import { getCurrentUser } from 'aws-amplify/auth';
import { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// Create a new user
export async function createUser(email: string, firstName: string, lastName: string) {
  const { data, errors } = await client.models.User.create({
    email,
    firstName,
    lastName
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Get a user by ID
export async function getUserById(userId: string) {
  const { data, errors } = await client.models.User.get({ id: userId });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// List all users
export async function listUsers() {
  const { data, errors } = await client.models.User.list();
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Update a user
export async function updateUser(userId: string, updates: Partial<Schema['User']>) {
  const { data, errors } = await client.models.User.update({
    id: userId,
    ...updates,
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Delete a user
export async function deleteUser(userId: string) {
  const { data, errors } = await client.models.User.delete({ id: userId });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}