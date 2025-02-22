"use client";
import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import type { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();
type TodoType = Schema["Todo"]["type"];
interface TodoClientProps {
	initialTodos: TodoType[];
	user: AuthUser;
}

export default function TodoClient({ initialTodos, user }: TodoClientProps) {
	const [todos, setTodos] = useState<TodoType[]>(initialTodos);
	const [userGroups, setUserGroups] = useState<string[]>([]);
	const [userRoles, setUserRoles] = useState<string[]>([]);

	// Define the subscription as a callback.
	const listTodos = useCallback(() => {
		const subscription = client.models.Todo.observeQuery().subscribe({
			next: (data) => setTodos([...data.items]),
		});
		return () => subscription.unsubscribe();
	}, []);

	// Add this function to get groups and roles
	const fetchUserGroupsAndRoles = useCallback(async () => {
		try {
			const session = await fetchAuthSession();
			const claims = session.tokens?.idToken?.payload;
			
			// Ensure we're getting arrays of strings and handle type safety
			const groups = claims?.groups;
			const roles = claims?.roles;
			
			setUserGroups(Array.isArray(groups) ? groups.filter((g): g is string => typeof g === 'string') : []);
			setUserRoles(Array.isArray(roles) ? roles.filter((r): r is string => typeof r === 'string') : []);
		} catch (error) {
			console.error('Error fetching user groups and roles:', error);
		}
	}, []);

	//On mount, re-initialize client-side auth so the Amplify client gets the proper session.
	//Once initialized, start the live query subscription.

	useEffect(() => {
		getCurrentUser()
			.then(() => {
				// Auth is initialized; start subscription and fetch groups/roles
				const unsubscribe = listTodos();
				fetchUserGroupsAndRoles();
				return unsubscribe;
			})
			.catch((err) => console.error("Client auth initialization failed", err));
	}, [listTodos, fetchUserGroupsAndRoles]);
	const deleteTodo = useCallback((id: string) => {
		client.models.Todo.delete({ id });
	}, []);
	const createTodo = () => {
		const content = window.prompt("Todo content");
		if (content) {
			client.models.Todo.create({ content });
		}
	};
	const handleKeyDown = (event: React.KeyboardEvent, callback: () => void) => {
		if (event.key === "Enter" || event.key === " ") {
			callback();
		}
	};
	return (
		<>
			<h1 className="govuk-heading-xl">Todo List</h1>
			<p className="govuk-body">Welcome {user.username}</p>
			
			{/* Add groups and roles display */}
			<div className="govuk-grid-row">
				<div className="govuk-grid-column-one-half">
					<h2 className="govuk-heading-m">Your Groups</h2>
					{userGroups.length > 0 ? (
						<ul className="govuk-list govuk-list--bullet">
							{userGroups.map((group) => (
								<li key={group}>{group}</li>
							))}
						</ul>
					) : (
						<p className="govuk-body">No groups assigned</p>
					)}
				</div>
				
				<div className="govuk-grid-column-one-half">
					<h2 className="govuk-heading-m">Your Roles</h2>
					{userRoles.length > 0 ? (
						<ul className="govuk-list govuk-list--bullet">
							{userRoles.map((role) => (
								<li key={role}>{role}</li>
							))}
						</ul>
					) : (
						<p className="govuk-body">No roles assigned</p>
					)}
				</div>
			</div>

			<button
				type="button"
				className="govuk-button"
				onClick={createTodo}
				onKeyDown={(e) => handleKeyDown(e, createTodo)}
			>
				New Todo
			</button>
			<ul className="govuk-list app-todo-list">
				{todos.map((todo) => (
					<li key={todo.id} className="app-todo-listitem">
						<button
							type="button"
							className="govuk-button govuk-button--secondary"
							onClick={() => deleteTodo(todo.id)}
							onKeyDown={(e) => handleKeyDown(e, () => deleteTodo(todo.id))}
						>
							{todo.content}
						</button>
					</li>
				))}
			</ul>
			{todos.length === 0 && (
				<div className="govuk-inset-text">
					No todos yet. Create one to get started!
				</div>
			)}
		</>
	);
}
