import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
    User: a.model({
        email: a.string().required(), // Email from Tenant Login
        firstName: a.string().required(), // Users Name
        lastName: a.string().required(),
        permissionGroup: a.enum(["ADMIN","MANAGER","SOCIAL_WORKER"]), // User role (SUBJECT TO CHANGE)
        lastLogin: a.datetime(), // Timestamp of last login
        createdAt: a.datetime(),
        modifiedAt: a.datetime(),
        forms: a.hasMany('Form', 'userID'),
        children: a.hasMany('Child','userID')
    }).authorization(allow => [
      allow.group('ADMIN'), //Admins have full CRUD on users
      allow.owner() // Users can manage their own User record
    ]),


    Form: a.model({
        caseNumber: a.string(),
        reason: a.string(),
        amount: a.float(),
        dateRequiredDay: a.integer(),
        dateRequiredMonth: a.integer(),
        dateRequiredYear: a.integer(),
        firstName: a.string(),
        lastName: a.string(),
        addressLineOne: a.string(),
        addressLineTwo: a.string(),
        addessTown: a.string(),
        addressPostcode: a.string(),
        receipt: a.hasMany('Receipt','formID'),
        userID: a.id(),
        user: a.belongsTo('User', 'userID'),
        status: a.enum(['DRAFT','SUBMITTED','AUTHORISED'])
    }).authorization(allow => [
      allow.publicApiKey().to(['read']), //everyne can view forms
      allow.group('ADMIN'), // adims have full CRUD on forms
      allow.owner() //Owners have full crud
    ]),

    Todo: a.model({
      content: a.string(),
    }).authorization((allow) => [allow.owner()]),


    // Child model from the Persons table in the SQL Schema
    Child: a.model({
      firstName: a.string().required(),
      lastName: a.string().required(),
      dateOfBirth: a.date().required(),
      sex: a.string().required(),
      gender: a.string().required(),
      userID: a.id(),
      user: a.belongsTo('User', 'userID')
    }).authorization((allow) => [
      allow.group('ADMIN'),
      allow.owner()
      ]),

    Receipt: a.model({
      formID: a.id(),
      form: a.belongsTo('Form', 'formID'),
      transactionDate: a.date(),
      merchantName: a.string(),
      paymentMethod: a.string(),
      subtotal: a.float(),
      itemDesc: a.string(),
    }).authorization((allow) => [
      allow.group('ADMIN'),
      allow.owner()
    ]),
    
    AuditLog: a.model({
      action: a.string().required(),
      date: a.date().required(),
    }).authorization((allow) => [
      allow.owner().to(['read']),
      allow.group('ADMIN')
    ])
});

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: 'userPool',
        apiKeyAuthorizationMode: {
            expiresInDays: 30,
        },
    },
});

/*
Amplify Gen 2 takes care of provisioning a fully functional, real‐time GraphQL 
API backed by DynamoDB for you. This means you don’t have to manually create
endpoints for CRUD operations—the framework automatically creates them for each model in your schema.

e.g.

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

// Create a new User record
await client.models.User.create({
  email: "user@example.com",
  firstName: "Jane",
  lastName: "Doe",
  permissionGroup: "ADMIN",
  // ... other fields
});

// Query User records
const { data: users, errors } = await client.models.User.list();

*/