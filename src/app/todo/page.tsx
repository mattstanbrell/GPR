import { redirect } from "next/navigation";
import TodoClient from "./TodoClient";
import {
	AuthGetCurrentUserServer,
	cookiesClient,
} from "@/utils/amplifyServerUtils";

export default async function TodoPage() {
	const user = await AuthGetCurrentUserServer();

	// middleware.ts handles this, but this fixes the 'null' is not assignable lint error
	if (!user) {
		redirect("/");
	}

	const todosResponse = await cookiesClient.models.Todo.list();

	return (
		<main className="govuk-main-wrapper">
			<div className="govuk-width-container">
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-two-thirds">
						<TodoClient initialTodos={todosResponse.data} user={user} />
					</div>
				</div>
			</div>
		</main>
	);
}
