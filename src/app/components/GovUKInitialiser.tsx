"use client";

import { useEffect, useState } from "react";
import { listUsers, getUserIdByEmail, updateUser , deleteUser} from '../../utils/apis';
import { type Schema } from '../../../amplify/data/resource';

type User = Schema['User']['type'];

export function GovUKFrontend() {
  // State to store the list of users
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Add js-enabled and govuk-frontend-supported classes
    document.body.className += ` js-enabled${"noModule" in HTMLScriptElement.prototype ? " govuk-frontend-supported" : ""}`;

    // Fetch and store users
    listUsers()
      .then((users) => {
        console.log(users); // Log the users to the console
        setUsers(users); // Store the users in state

        // Log the ID of the first user
        if (users.length > 0) {
          console.log("First user ID:", users[0].id);
        } else {
          console.log("No users found.");
        }
      })
      .catch((error) => console.error(error));

    // Fetch user ID by email and update the user's first name
    getUserIdByEmail('yes')
      .then((userId) => {
        console.log("User ID by email:", userId);

        if (userId) {
          // Update the user's first name
          updateUser(userId, { firstName: "ohyeah" })
            .then((updatedUser) => {
              console.log("User updated successfully:", updatedUser);
            })
            .catch((error) => {
              console.error("Error updating user:", error);
            });
		deleteUser(userId).then((deletedUser) => {
			console.log('user deleted',deletedUser);
		}).catch((error) => {
			console.log('error deleting user',error)
		})
        } else {
          console.log("No user found with the given email.");
        }
      })
      .catch((error) => {
        console.error("Error fetching user ID by email:", error);
      });

    // Initialize GOV.UK Frontend by dynamically importing the module.
    (async () => {
      const { initAll } = await import("govuk-frontend");
      initAll();
    })();
  }, []);

  return null;
}