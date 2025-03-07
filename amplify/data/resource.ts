import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  User: a.model({
    email: a.string().required(), 
    firstName: a.string().required(), 
    lastName: a.string().required(),
    permissionGroup: a.enum(["ADMIN", "MANAGER", "SOCIAL_WORKER"]),
    lastLogin: a.datetime(),
    createdForms: a.hasMany('Form', 'creatorID'),
    assignments: a.hasMany('FormAssignee', 'userID'),
    children: a.hasMany('UserChild', 'userID'),
    audits: a.hasMany('AuditLog', 'userID'),
    messages: a.hasMany('Message','userID'),
    threads: a.hasMany('UserThread','userID'),
    messagesRead: a.hasMany('UserMessage','userID'),
    userSettings: a.customType({
      fontSize: a.integer(),
      font: a.string(),
      fontColour: a.string(),
      bgColour: a.string(),
      spacing: a.integer()
    })
  }).authorization(allow => [
    allow.authenticated()
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
    creatorID: a.id().required(),
    creator: a.belongsTo('User', 'creatorID'),
    childID: a.id(),
    child: a.belongsTo('Child', 'childID'),
    audits: a.hasMany('AuditLog', 'formID'),
    feedback: a.string(),
    thread: a.hasOne('Thread', 'formID'),
    assignees: a.hasMany('FormAssignee', 'formID')
  }).authorization(allow => [
    allow.authenticated()
  ]),

  FormAssignee: a.model({
    formID: a.id().required(),
    userID: a.id().required(),
    form: a.belongsTo('Form', 'formID'),
    user: a.belongsTo('User', 'userID')
  }).authorization(allow => [
    allow.authenticated()
  ]),

  Todo: a.model({
    content: a.string(),
    isDone: a.boolean()
  }).authorization(allow => [
    allow.authenticated()
  ]),

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
    itemDesc: a.string()
  }).authorization(allow => [
    allow.authenticated()
  ]),

  AuditLog: a.model({
    action: a.string().required(),
    date: a.date().required(),
    userID: a.id(),
    user: a.belongsTo('User', 'userID'),
    formID: a.id(),
    form: a.belongsTo('Form', 'formID')
  }).authorization(allow => [
    allow.authenticated()
  ]),

  Message: a.model({
    userID: a.id().required(),
    threadID: a.id().required(),
    user: a.belongsTo('User','userID'),
    thread: a.belongsTo('Thread','threadID'),
    content: a.string().required(),
    usersRead: a.hasMany('UserMessage', 'messageID'),
    readStatus: a.string().default('false'), //enum(['false','medium','true'])
    timeSent: a.datetime() //datetime()
  }).authorization(allow => [
    allow.authenticated()
  ]),

  UserThread: a.model({
    userID: a.id().required(),
    threadID: a.id().required(),
    user: a.belongsTo('User','userID'),
    thread: a.belongsTo('Thread','threadID')
  }).authorization(allow => [
    allow.authenticated()
  ]),

  //Provides an indication of which users have read which message.
  UserMessage: a.model({
    userID: a.id().required(),
    messageID: a.id().required(),
    user: a.belongsTo('User','userID'),
    message: a.belongsTo('Message','messageID')
  }).authorization(allow => [
    allow.authenticated()
  ]),

  Thread: a.model({
    formID: a.id().required(),
    form: a.belongsTo('Form','formID'),
    lastMessageTime: a.datetime(),
    users: a.hasMany('UserThread','threadID'),
    messages: a.hasMany('Message','threadID'),
    unreadCount: a.integer()
  }).authorization(allow => [
    allow.authenticated()
  ]),

  UserChild: a.model({
    childID: a.id().required(),
    userID: a.id().required(),
    child: a.belongsTo('Child', 'childID'),
    user: a.belongsTo('User', 'userID')
  }).authorization(allow => allow.authenticated())
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30
    }
  }
});
