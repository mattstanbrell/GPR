import { type NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";

export async function middleware(request: NextRequest) {
	const response = NextResponse.next();

	if (request.nextUrl.pathname === "/") {
		return response;
	}

	const authenticated = await runWithAmplifyServerContext({
		nextServerContext: { request, response },
		operation: async (contextSpec) => {
			try {
				const session = await fetchAuthSession(contextSpec, {});
				const hasTokens = session.tokens !== undefined;
				return hasTokens;
			} catch (error: unknown) {
				console.error("Error in middleware:", error);
				return false;
			}
		},
	});

	if (authenticated) {
		return response;
	}

	return NextResponse.redirect(new URL("/auth", request.url));
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
