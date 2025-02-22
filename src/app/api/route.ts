
import { cookies } from "next/headers";

const baseURI = "https://graph.microsoft.com"


export async function GET(request: Request) {
    
    const cookie = await cookies();
    // console.log(cookie)
    const apiToken = cookie.get("CognitoIdentityServiceProvider.6529p7cs18451ug2rm0dhe1r7b.microsoftentraid_qjotdcjbxthxbyfbkhltqqdnwbf70ssr11pz-3ipd3u.accessToken")["value"]
    const headers = new Headers({ "Authorization": `Bearer ${apiToken}`});

    const data = await fetch(`${baseURI}/me`, { headers, method: "GET" });
    console.log(data)
    
    return data;
}