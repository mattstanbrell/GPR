// import { createUser, createForm, createAuditLog } from "./utils/apis";

// export default async function seedDummyData() {
//   console.log("Seeding dummy data...");

//   // Step 1: Create Dummy Users
//   const dummyUsers = [
//     {
//       email: "john.doe@example.com",
//       firstName: "John",
//       lastName: "Doe",
//     },
//     {
//       email: "jane.doe@example.com",
//       firstName: "Jane",
//       lastName: "Doe",
//     },
//     {
//       email: "bob.smith@example.com",
//       firstName: "Bob",
//       lastName: "Smith",
//     },
//   ];

//   const createdUsers = [];
//   for (const user of dummyUsers) {
//     try {
//       const createdUser = await createUser(user.email, user.firstName, user.lastName);
//       if (!createdUser) {
//         console.error("User creation failed. Skipping this user.");
//         continue;
//       }
//       console.log("User created:", createdUser);
//       createdUsers.push(createdUser);
//     } catch (error) {
//       console.error("Error creating user:", error);
//     }
//   }

//   // Step 2: Create Dummy Forms
//   const dummyForms = [
//     {
//       caseNumber: "CASE001",
//       reason: "Travel expenses",
//       amount: 500,
//       dateRequired: { day: 15, month: 10, year: 2023 },
//       recipientDetails: {
//         name: { firstName: "Alice", lastName: "Johnson" },
//         address: {
//           lineOne: "123 Main St",
//           lineTwo: "Apt 4B",
//           townOrCity: "New York",
//           postcode: "10001",
//         },
//       },
//       status: "SUBMITTED" as const,
//       creatorID: "user_A001",
//     },
//     {
//       caseNumber: "CASE002",
//       reason: "Office supplies",
//       amount: 200,
//       dateRequired: { day: 20, month: 10, year: 2023 },
//       recipientDetails: {
//         name: { firstName: "Bob", lastName: "Smith" },
//         address: {
//           lineOne: "456 Elm St",
//           lineTwo: "",
//           townOrCity: "Los Angeles",
//           postcode: "90001",
//         },
//       },
//       status: "DRAFT" as const,
//       creatorID: "user_A002",
//     },
//     {
//       caseNumber: "CASE003",
//       reason: "Training fees",
//       amount: 1000,
//       dateRequired: { day: 25, month: 10, year: 2023 },
//       recipientDetails: {
//         name: { firstName: "Charlie", lastName: "Brown" },
//         address: {
//           lineOne: "789 Oak St",
//           lineTwo: "Suite 12",
//           townOrCity: "Chicago",
//           postcode: "60601",
//         },
//       },
//       status: "AUTHORISED" as const,
//       creatorID: "user_A003",
//     },
//   ];

//   const createdForms = [];
//   for (const form of dummyForms) {
//     try {
//       if (!form.creatorID) {
//         console.error("Creator ID is missing. Skipping form creation.");
//         continue;
//       }
//       const createdForm = await createForm(
//         form.caseNumber,
//         form.reason,
//         form.amount,
//         form.dateRequired,
//         form.recipientDetails,
//         form.status,
//         form.creatorID
//       );
//       if (!createdForm) {
//         console.error("Form creation failed. Skipping this form.");
//         continue;
//       }
//       console.log("Form created:", createdForm);
//       createdForms.push(createdForm);
//     } catch (error) {
//       console.error("Error creating form:", error);
//     }
//   }

//   // Step 3: Create Dummy Audit Logs
//   const dummyAuditLogs = [
//     {
//       action: "approved",
//       date: new Date().toISOString(),
//       userID: createdUsers[0]?.id,
//       formID: createdForms[0]?.id,
//     },
//     {
//       action: "submitted",
//       date: new Date().toISOString(),
//       userID: createdUsers[1]?.id,
//       formID: createdForms[1]?.id,
//     },
//     {
//       action: "reviewed",
//       date: new Date().toISOString(),
//       userID: createdUsers[2]?.id,
//       formID: createdForms[2]?.id,
//     },
//   ];

//   for (const log of dummyAuditLogs) {
//     try {
//       if (!log.userID || !log.formID) {
//         console.error("User ID or Form ID is missing. Skipping audit log creation.");
//         continue;
//       }
//       const createdAuditLog = await createAuditLog(
//         log.action,
//         log.date,
//         log.userID,
//         log.formID
//       );
//       if (!createdAuditLog) {
//         console.error("AuditLog creation failed. Skipping this audit log.");
//         continue;
//       }
//       console.log("AuditLog created:", createdAuditLog);
//     } catch (error) {
//       console.error("Error creating AuditLog:", error);
//     }
//   }

//   console.log("Dummy data seeding completed.");
// }

// // Run the seed function
// seedDummyData().catch((error) => {
//   console.error("Error seeding dummy data:", error);
// });