import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
    User: a.model({
        email: a.string().required(), 
        firstName: a.string().required(), 
        lastName: a.string().required(),
        permissionGroup: a.enum(["ADMIN","MANAGER","SOCIAL_WORKER"]), 
        lastLogin: a.datetime(), 
        forms: a.hasMany('Form', 'userID'),
        children: a.hasMany('UserChild','userID'),
        audits: a.hasMany('AuditLog','userID'),
        messages: a.hasMany('Message','userID'),
        threads: a.hasMany('UserThread','userID'),
    }).authorization(allow => [
      allow.group('ADMIN'), 
      allow.owner()
    ]),


    Form: a.model({
      caseNumber: a.string(),
      reason: a.string(),
      amount: a.float(),
      dateRequired: a.customType({
          day: a.integer(),
          month: a.integer(),
          year: a.integer()
      }),
      recipientDetails: a.customType({
          name: a.customType({
              firstName: a.string(),
              lastName: a.string()
          }),
          address: a.customType({
              lineOne: a.string(),
              lineTwo: a.string(),
              townOrCity: a.string(),
              postcode: a.string()
          })
      }),
      status: a.enum(['DRAFT', 'SUBMITTED', 'AUTHORISED', 'VALIDATED', 'COMPLETED']),
      receipt: a.hasMany('Receipt', 'formID'),
      userID: a.id(),
      user: a.belongsTo('User', 'userID'),
      childID: a.id(),
      child: a.belongsTo('Child', 'childID'),
        thread: a.hasOne('Thread', 'formID'),
      audits: a.hasMany('AuditLog','formID'),
      feedback: a.string()
    }).authorization(allow => [
      allow.publicApiKey().to(['read']), 
      allow.group('ADMIN'), 
      allow.owner()
  ]),

  
    Todo: a.model({
      content: a.string(),
      isDone: a.boolean()
    }).authorization((allow) => [allow.owner()]),



    Child: a.model({
      firstName: a.string().required(),
      lastName: a.string().required(),
      dateOfBirth: a.date().required(),
      sex: a.string().required(),
      gender: a.string().required(),
      user: a.hasMany('UserChild', 'childID'),
      form: a.hasMany('Form','childID')
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
      userID: a.id(),
      user: a.belongsTo('User','userID'),
      formID: a.id(),
      form: a.belongsTo('Form','formID')
    }).authorization((allow) => [
      allow.owner().to(['read']),
      allow.group('ADMIN')
    ]),

    Message: a.model({
        userID: a.id().required(),
        threadID: a.id().required(),
        user: a.belongsTo('User','userID'),
        thread: a.belongsTo('Thread','threadID'),
        content: a.string().required(),
        timeSent: a.datetime().required()
    }).authorization((allow) => [
        allow.owner().to(['read']),
        allow.group('ADMIN')
    ]),

    UserThread: a.model({
        userID: a.id().required(),
        threadID: a.id().required(),
        user: a.belongsTo('User','userID'),
        thread: a.belongsTo('Thread','threadID')
    }).authorization((allow) => [
        allow.owner().to(['read']),
        allow.group('ADMIN')
    ]),



    Thread: a.model({
        formID: a.id(),
        form: a.belongsTo('Form','formID'),
        lastMessageTime: a.datetime().required(),
        users: a.hasMany('UserThread','threadID'),
        messages: a.hasMany('Message','threadID')
    }).authorization((allow) => allow.publicApiKey()),

    UserChild: a.model({
      childID: a.id().required(),
      userID: a.id().required(),
      child: a.belongsTo('Child','childID'),
      user: a.belongsTo('User','userID')
    }).authorization((allow) => allow.publicApiKey())
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

