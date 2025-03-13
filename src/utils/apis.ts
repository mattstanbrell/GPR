import { generateClient } from "@aws-amplify/api";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

/*
To correctly get type hints and to not upset the typescript
type checker, you must include:

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
	};
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
	const { data, errors } = await client.models.User.create({
		email,
		firstName,
		lastName,
	});
	if (errors) {
		throw new Error(errors[0].message);
	}
	return data;
}

export async function getUserByEmail(email: string | undefined) {
	const { data, errors } = await client.models.User.list({
		filter: { email: { eq: email } },
	});
	if (errors) {
		throw new Error(errors[0].message);
	}
	return data[0];
}

export async function getUserIdByEmail(email: string): Promise<string> {
	const { data, errors } = await client.models.User.list({
		filter: { email: { eq: email } },
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
	const { data, errors } = await client.models.User.update({
		id: userId,
		...updates,
	});
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
export async function createForm(formData: Partial<Schema["Form"]["type"]> & { creatorID: string }) {
	const { data, errors } = await client.models.Form.create(formData);
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
export async function updateForm(formId: string, updates: Partial<Schema["Form"]["type"]>) {
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
export async function getFormsCreatedByUser(userId: string, status?: string) {
	const filter: { creatorID: { eq: string }; status?: { eq: string } } = { creatorID: { eq: userId } };

	if (status) {
		filter.status = { eq: status };
	}

	const { data, errors } = await client.models.Form.list({
		filter: filter,
		limit: 1000,
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
	const { data, errors } = await client.models.FormAssignee.delete({
		id: links[0].id,
	});
	if (errors) {
		throw new Error(errors[0].message);
	}
	return data;
}

// Returns all forms assigned to a specific user
export async function getFormsAssignedToUser(userId: string, status?: string) {
	const { data: assignments, errors } = await client.models.FormAssignee.list({
		filter: { userID: { eq: userId } },
	});

	if (errors) {
		throw new Error(errors[0].message);
	}

	const forms = await Promise.all(
		assignments.map(async (assignment) => {
			const { data: form, errors: formErrors } = await client.models.Form.get({
				id: assignment.formID,
			});
			if (formErrors) {
				throw new Error(formErrors[0].message);
			}
			return form;
		}),
	);

	const filteredForms = forms.filter((form) => form !== null);

	if (status) {
		return filteredForms.filter((form) => form.status === status);
	}

	return filteredForms;
}

// fetch all users assigned to a specific form
export async function getAssigneesForForm(formId: string) {
	const { data: assignments, errors } = await client.models.FormAssignee.list({
		filter: { formID: { eq: formId } },
	});
	if (errors) {
		throw new Error(errors[0].message);
	}
	const users = await Promise.all(
		assignments.map(async (assignment) => {
			const { data: user, errors: userErrors } = await client.models.User.get({
				id: assignment.userID,
			});
			if (userErrors) {
				throw new Error(userErrors[0].message);
			}
			return user;
		}),
	);
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

	const { data, errors } = await client.models.UserChild.delete({
		id: links[0].id,
	});
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
		}),
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
			const { data: user, errors: userErrors } = await client.models.User.get({
				id: link.userID,
			});
			if (userErrors) {
				throw new Error(userErrors[0].message);
			}
			return user;
		}),
	);

	return users;
}

//------------------ Child APIs ------------------

// Create a new child
export async function createChild(
	caseNumber: string,
	firstName: string,
	lastName: string,
	dateOfBirth: string,
	sex: string,
	gender: string,
) {
	const { data, errors } = await client.models.Child.create({
		caseNumber,
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

// --------- Receipt APIs ----------

// Create a new receipt
export async function createReceipt(
	formID: string,
	transactionDate: string,
	merchantName: string,
	paymentMethod: string,
	subtotal: number,
	itemDesc: string,
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
	const { data, errors } = await client.models.Receipt.delete({
		id: receiptId,
	});
	if (errors) {
		throw new Error(errors[0].message);
	}
	return data;
}

// -------------- AuditLog APIs --------------

// Create a new audit log
export async function createAuditLog(action: string, date: string, userID: string, formID: string) {
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
	const { data, errors } = await client.models.AuditLog.delete({
		id: auditLogId,
	});
	if (errors) {
		throw new Error(errors[0].message);
	}
	return data;
}

// List all audit logs for a specific user
export async function getAuditLogsForUser(userId: string) {
	const { data, errors } = await client.models.AuditLog.list({
		filter: { userID: { eq: userId } },
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

// ------------------ NormConversation APIs --------------
// Get NormConversation by form ID
export async function getNormConversationByFormId(formId: string) {
	const { data, errors } = await client.models.NormConversation.list({
		filter: { formID: { eq: formId } },
	});
	if (errors) {
		throw new Error(errors[0].message);
	}
	return data[0] || null;
}

// Create a new NormConversation
export async function createNormConversation(formId: string, messages: string) {
	const { data, errors } = await client.models.NormConversation.create({
		formID: formId,
		messages,
	});
	if (errors) {
		throw new Error(errors[0].message);
	}
	return data;
}

// Update a NormConversation
export async function updateNormConversation(conversationId: string, messages: string) {
	const { data, errors } = await client.models.NormConversation.update({
		id: conversationId,
		messages,
	});
	if (errors) {
		throw new Error(errors[0].message);
	}
	return data;
}
