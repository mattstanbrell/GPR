import {generateClient} from '@aws-amplify/api';
import {Schema} from '../../amplify/data/resource';
import {DateTimeAttribute} from "aws-cdk-lib/aws-cognito";
import {infer} from "zod";

const client = generateClient<Schema>();

/*
To correctly get type hints and to not upset the typescript
typer checker, you must include:

type User = Schema['User']['type'];

for any Model types you might be using in your components

If you wanted to store a list of users which could be updated in
your component, you would need this line:

const [users, setUsers] = useState<User[]>([]);


*/

// Update Types
type UserUpdates = {
  firstName?: string;
  lastName?: string;
  email?: string;
  permissionGroup?: "ADMIN" | "MANAGER" | "SOCIAL_WORKER" | null;
  lastLogin?: string;
  userSettings?: {
    fontSize: number;
    font: string;
    fontColour: string;
    bgColour: string;
    spacing: number;
  }
};

type FormUpdates = {
  caseNumber?: string;
  reason?: string;
  amount?: number;
  dateRequired?: { day: number; month: number; year: number };
  recipientDetails?: {
    name?: { firstName?: string; lastName?: string };
    address?: { lineOne?: string; lineTwo?: string; townOrCity?: string; postcode?: string };
  };
  status?: "DRAFT" | "SUBMITTED" | "AUTHORISED" | "VALIDATED" | "COMPLETED" | null;
  creatorID?: string;
  childID?: string;
  feedback?: string;
};

type ChildUpdates = {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  sex?: string;
  gender?: string;
};

type ReceiptUpdates = {
  transactionDate?: string;
  merchantName?: string;
  paymentMethod?: string;
  subtotal?: number;
  itemDesc?: string;
};

type AuditLogUpdates = {
  action?: string;
  date?: string;
  userID?: string;
  formID?: string;
};

// ----------User APIs-----------
export async function createUser(email: string, firstName: string, lastName: string) {
  const { data, errors } = await client.models.User.create({ email, firstName, lastName });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

export async function getUserByEmail(email: string) {
  const { data, errors } = await client.models.User.list({
    filter: { email: { eq: email } }
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

export async function getUserIdByEmail(email: string): Promise<string> {
  const { data, errors } = await client.models.User.list({
    filter: { email: { eq: email } }
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  if (data.length === 0) {
    throw new Error(`No user found with email: ${email}`);
  }
  return data[0].id;
}

export async function getUserById(userId: string) {
  const { data, errors } = await client.models.User.get({ id: userId });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

export async function listUsers() {
  const { data, errors } = await client.models.User.list();
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

export async function updateUser(userId: string, updates: UserUpdates) {
  const { data, errors } = await client.models.User.update({ id: userId, ...updates });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

export async function deleteUser(userId: string) {
  const { data, errors } = await client.models.User.delete({ id: userId });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// ------------Form APIs -------------
export async function createForm(
  caseNumber: string,
  reason: string,
  amount: number,
  dateRequired: { day: number; month: number; year: number },
  recipientDetails: {
    name: { firstName: string; lastName: string };
    address: { lineOne: string; lineTwo: string; townOrCity: string; postcode: string };
  },
  status: "DRAFT" | "SUBMITTED" | "AUTHORISED" | "VALIDATED" | "COMPLETED",
  creatorID: string,
  childID?: string,
  feedback?: string
) {
  const { data, errors } = await client.models.Form.create({
    caseNumber,
    reason,
    amount,
    dateRequired,
    recipientDetails,
    status,
    creatorID,
    childID,
    feedback,
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Get a form by ID
export async function getFormById(formId: string) {
  const { data, errors } = await client.models.Form.get({ id: formId });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// List all forms
export async function listForms() {
  const { data, errors } = await client.models.Form.list();
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Update a form
export async function updateForm(formId: string, updates: FormUpdates) {
  const { data, errors } = await client.models.Form.update({
    id: formId,
    ...updates,
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Delete a form
export async function deleteForm(formId: string) {
  const { data, errors } = await client.models.Form.delete({ id: formId });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Returns all forms created by a specific user by filtering on creatorID
export async function getFormsCreatedByUser(userId: string) {
  const { data, errors } = await client.models.Form.list({
    filter: { creatorID: { eq: userId } },
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// fetch all forms associated with a specific child
export async function getFormsForChild(childId: string) {
    const { data, errors } = await client.models.Form.list({
      filter: { childID: { eq: childId } },
    });
    if (errors) {
      throw new Error(errors[0].message);
    }
    return data;
}

// ------------------ FormAssignee APIs --------------
// assign a user to a form
export async function assignUserToForm(formId: string, userId: string) {
  const { data, errors } = await client.models.FormAssignee.create({
    formID: formId,
    userID: userId,
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// unassign a user from a form
export async function unassignUserFromForm(formId: string, userId: string) {
  const { data: links, errors: findErrors } = await client.models.FormAssignee.list({
    filter: {
      formID: { eq: formId },
      userID: { eq: userId },
    },
  });
  if (findErrors) {
    throw new Error(findErrors[0].message);
  }
  if (links.length === 0) {
    throw new Error("No assignment found between the user and form.");
  }
  const { data, errors } = await client.models.FormAssignee.delete({ id: links[0].id });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Returns all forms assigned to a specific user
export async function getFormsAssignedToUser(userId: string) {
  const { data: assignments, errors } = await client.models.FormAssignee.list({
    filter: { userID: { eq: userId } },
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  const forms = await Promise.all(assignments.map(async (assignment) => {
    const { data: form, errors: formErrors } = await client.models.Form.get({ id: assignment.formID });
    if (formErrors) {
      throw new Error(formErrors[0].message);
    }
    return form;
  }));
  return forms;
}

// fetch all users assigned to a specific form
export async function getAssigneesForForm(formId: string) {
    const { data: assignments, errors } = await client.models.FormAssignee.list({
      filter: { formID: { eq: formId } },
    });
    if (errors) {
      throw new Error(errors[0].message);
    }
    const users = await Promise.all(assignments.map(async (assignment) => {
      const { data: user, errors: userErrors } = await client.models.User.get({ id: assignment.userID });
      if (userErrors) {
        throw new Error(userErrors[0].message);
      }
      return user;
    }));
    return users;
}

// ------------------ UserChild link APISs --------------

export async function linkUserToChild(userId: string, childId: string) {
    const { data, errors } = await client.models.UserChild.create({
      userID: userId,
      childID: childId,
    });
    if (errors) {
      throw new Error(errors[0].message);
    }
    return data;
  }


export async function unlinkUserFromChild(userId: string, childId: string) {

  const { data: links, errors: findErrors } = await client.models.UserChild.list({
    filter: {
      userID: { eq: userId },
      childID: { eq: childId },
    },
  });
  if (findErrors) {
    throw new Error(findErrors[0].message);
  }

  if (links.length === 0) {
    throw new Error("No link found between the user and child.");
  }

  const { data, errors } = await client.models.UserChild.delete({ id: links[0].id });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

export async function getChildrenForUser(userId: string) {
    const { data: links, errors: findErrors } = await client.models.UserChild.list({
      filter: {
        userID: { eq: userId },
      },
    });
    if (findErrors) {
      throw new Error(findErrors[0].message);
    }

    const children = await Promise.all(
      links.map(async (link) => {
        const { data: child, errors: childErrors } = await client.models.Child.get({ id: link.childID });
        if (childErrors) {
          throw new Error(childErrors[0].message);
        }
        return child;
      })
    );

    return children;
  }

export async function getUsersForChild(childId: string) {

  const { data: links, errors: findErrors } = await client.models.UserChild.list({
    filter: {
      childID: { eq: childId },
    },
  });
  if (findErrors) {
    throw new Error(findErrors[0].message);
  }

  const users = await Promise.all(
    links.map(async (link) => {
      const { data: user, errors: userErrors } = await client.models.User.get({ id: link.userID });
      if (userErrors) {
        throw new Error(userErrors[0].message);
      }
      return user;
    })
  );

  return users;
}

//------------------ Child APIs ------------------

// Create a new child
export async function createChild(
    firstName: string,
    lastName: string,
    dateOfBirth: string,
    sex: string,
    gender: string
) {
  const { data, errors } = await client.models.Child.create({
    firstName,
    lastName,
    dateOfBirth,
    sex,
    gender,
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Get a child by ID
export async function getChildById(childId: string) {
  const { data, errors } = await client.models.Child.get({ id: childId });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// List all children
export async function listChildren() {
  const { data, errors } = await client.models.Child.list(
      {

      }
  );
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Update a child
export async function updateChild(childId: string, updates: ChildUpdates) {
  const { data, errors } = await client.models.Child.update({
    id: childId,
    ...updates,
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Delete a child
export async function deleteChild(childId: string) {
  const { data, errors } = await client.models.Child.delete({ id: childId });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// --------- Receipt APIs ----------

// Create a new receipt
export async function createReceipt(
  formID: string,
  transactionDate: string,
  merchantName: string,
  paymentMethod: string,
  subtotal: number,
  itemDesc: string
) {
  const { data, errors } = await client.models.Receipt.create({
    formID,
    transactionDate,
    merchantName,
    paymentMethod,
    subtotal,
    itemDesc,
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Get a receipt by ID
export async function getReceiptById(receiptId: string) {
  const { data, errors } = await client.models.Receipt.get({ id: receiptId });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// List all receipts
export async function listReceipts() {
  const { data, errors } = await client.models.Receipt.list();
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Update a receipt
export async function updateReceipt(receiptId: string, updates: ReceiptUpdates) {
  const { data, errors } = await client.models.Receipt.update({
    id: receiptId,
    ...updates,
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Delete a receipt
export async function deleteReceipt(receiptId: string) {
  const { data, errors } = await client.models.Receipt.delete({ id: receiptId });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// -------------- AuditLog APIs --------------

// Create a new audit log
export async function createAuditLog(
  action: string,
  date: string,
  userID: string,
  formID: string
) {
  const { data, errors } = await client.models.AuditLog.create({
    action,
    date,
    userID,
    formID,
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Get an audit log by ID
export async function getAuditLogById(auditLogId: string) {
  const { data, errors } = await client.models.AuditLog.get({ id: auditLogId });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// List all audit logs
export async function listAuditLogs() {
  const { data, errors } = await client.models.AuditLog.list();
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Update an audit log
export async function updateAuditLog(auditLogId: string, updates: AuditLogUpdates) {
  const { data, errors } = await client.models.AuditLog.update({
    id: auditLogId,
    ...updates,
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Delete an audit log
export async function deleteAuditLog(auditLogId: string) {
  const { data, errors } = await client.models.AuditLog.delete({ id: auditLogId });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// List all audit logs for a specific user
export async function getAuditLogsForUser(userId: string) {
    const { data, errors } = await client.models.AuditLog.list({
      filter: { userID: { eq: userId } }
    });
    if (errors) {
      throw new Error(errors[0].message);
    }
    return data;
}

// fetch all audit logs for a specific form
export async function getAuditLogsForForm(formId: string) {
    const { data, errors } = await client.models.AuditLog.list({
      filter: { formID: { eq: formId } },
    });
    if (errors) {
      throw new Error(errors[0].message);
    }
    return data;
}

// -------------- Thread APIs --------------

// Create a new thread
export async function createThread(
    formID: string,
) {
  const { data, errors } = await client.models.Thread.create({
    formID,
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Returns all users part of a specific thread.
export async function getUsersInThread(threadID: string) {
  const { data: users, errors } = await client.models.UserThread.list({
    filter: { threadID: { eq: threadID} },
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return await Promise.all(users.map(async (userThread) => {
    const {data: user, errors: userErrors} = await client.models.User.get({id: userThread.userID});
    if (userErrors) {
      throw new Error(userErrors[0].message);
    }
    return user;
  }));
}

// Returns number of all unread messages part of a specific thread.
export async function getUnreadMessagesCount(threadID: string) {
  const { data: messages, errors } = await client.models.Message.list({
    filter: { threadID: { eq: threadID}, readStatus: {eq: false} }, //set back to boolean.
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return messages.length;
}

// Returns all threads a user is a member of.
export async function getThreadsWithUser(userID: string) {
  const { data: threads, errors } = await client.models.UserThread.list({
    filter: { userID: { eq: userID} },
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return await Promise.all(threads.map(async (userThread) => {
    const {data: thread, errors: threadErrors} = await client.models.Thread.get({id: userThread.threadID});
    if (threadErrors) {
      throw new Error(threadErrors[0].message);
    }
    return thread;
  }));
}

//Create a hook(subscribe) that increments threads unread message count(new field) on update.



// -------------- Message APIs --------------

// Create a new message
export async function createMessage(
    userID: string,
    threadID: string,
    content: string,
    timeSent: DateTimeAttribute
) {
  const { data, errors } = await client.models.Message.create({
    userID,
    threadID,
    content,
    timeSent
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Mark message as read.
export async function setMessageToRead(
    messageID: string,
) {
  const { data, errors } = await client.models.Message.update({
    id: messageID,
    readStatus: true
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  //console.log(data);
  return data;
}

// Mark all unread messages in a certain thread as read.
export async function setThreadMessagesToRead(threadID: string) {
  const { data: unreadMessages, errors } = await client.models.Message.list({
    filter: { threadID: { eq: threadID}, readStatus: {eq: false} }, //set back to boolean.
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return await Promise.all(unreadMessages.map(async (message) => {
    const {data: thread, messageErrors} = await setMessageToRead(message.id);
    if (messageErrors) {
      throw new Error(messageErrors[0].message);
    }
    return thread;
  }));
}
