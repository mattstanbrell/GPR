import { type NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";

export async function middleware(request: NextRequest) {
	const response = NextResponse.next();
	const isHomePage = request.nextUrl.pathname === "/";

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

	if (!authenticated && !isHomePage) {
		// Redirect to the home page if not authenticated
		return NextResponse.redirect(new URL("/", request.url));
	}

	if (authenticated && isHomePage) {
		// Redirect to /home if authenticated and on the "/" page
		return NextResponse.redirect(new URL("/home", request.url));
	}

	// Continue to the requested page.
	// If user is not authenticated, this is the sign in page.
	return response;
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
