"use client";
import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();
type TodoType = Schema["Todo"]["type"];
interface TodoClientProps {
	initialTodos: TodoType[];
	user: AuthUser;
}


export default function TodoClient({ initialTodos, user }: TodoClientProps) {
	const [todos, setTodos] = useState<TodoType[]>(initialTodos);
	// Define the subscription as a callback.
	const listTodos = useCallback(() => {
		const subscription = client.models.Todo.observeQuery().subscribe({
			next: (data) => setTodos([...data.items]),
		});
		return () => subscription.unsubscribe();
	}, []);

	//On mount, re-initialize client-side auth so the Amplify client gets the proper session.
	//Once initialized, start the live query subscription.

	useEffect(() => {
		getCurrentUser()
			.then(() => {
				// Auth is initialized; start subscription.
				const unsubscribe = listTodos();
				return unsubscribe;
			})
			.catch((err) => console.error("Client auth initialization failed", err));
	}, [listTodos]);
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
