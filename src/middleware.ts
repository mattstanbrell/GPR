import { type NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";

export async function middleware(request: NextRequest) {
	console.log("[Middleware] Request path:", request.nextUrl.pathname);
	const response = NextResponse.next();

	if (request.nextUrl.pathname === "/") {
		console.log("[Middleware] Home page request - skipping auth check");
		return response;
	}

	console.log("[Middleware] Starting authentication check");
	const authenticated = await runWithAmplifyServerContext({
		nextServerContext: { request, response },
		operation: async (contextSpec) => {
			try {
				console.log("[Middleware] Fetching auth session");
				const session = await fetchAuthSession(contextSpec, {});
				const hasTokens = session.tokens !== undefined;
				console.log(
					"[Middleware] Auth session result:",
					hasTokens ? "authenticated" : "not authenticated",
				);
				return hasTokens;
			} catch (error) {
				console.error("[Middleware] Auth error:", error);
				return false;
			}
		},
	});

	if (authenticated) {
		console.log("[Middleware] User authenticated - allowing access");
		return response;
	}

	console.log("[Middleware] User not authenticated - redirecting to home");
	return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
