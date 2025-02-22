
import { cookies } from "next/headers";

const baseURI = "https://graph.microsoft.com"


export async function GET(request: Request) {
    
    const cookie = await cookies();
    // console.log(cookie)
    const apiToken = cookie.get("CognitoIdentityServiceProvider.6s4jaj56ljg3ggajac42c7a4q6.microsoftentraid__c8wkrdm5-tbyunwekzlnpfc2hukcau0jmhgvqvhp5s.accessToken")["value"]
    const headers = new Headers({ "Authorization": `Bearer ${apiToken}`});

    const data = await fetch(`${baseURI}/me`, { headers, method: "GET" });
    console.log(data)
    
    return data;
}