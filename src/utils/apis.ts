import { generateClient } from '@aws-amplify/api';
import { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// Update Types 

type UserUpdates = {
  firstName?: string;
  lastName?: string;
  email?: string;
  permissionGroup?: "ADMIN" | "MANAGER" | "SOCIAL_WORKER" | null;
  lastLogin?: string;
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
  userID?: string;
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

// User APIs 

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

// Get user by email
export async function getUserByEmail(email: string) {
  const { data, errors } = await client.models.User.list({
    filter: {
      email: { eq: email }
    }
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data;
}

// Get user ID by email
export async function getUserIdByEmail(email: string): Promise<string> {
  const { data, errors } = await client.models.User.list({
    filter: {
      email: { eq: email }
    }
  });
  if (errors) {
    throw new Error(errors[0].message);
  }
  if (data.length === 0) {
    throw new Error(`No user found with email: ${email}`);
  }
  return data[0].id;
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
export async function updateUser(userId: string, updates: UserUpdates) {
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

// Form APIs 

// Create a new form
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
  userID: string,
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
    userID,
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

// Child APIs 

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
  const { data, errors } = await client.models.Child.list();
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

// Receipt APIs 

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

//  AuditLog APIs 

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