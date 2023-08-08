import { IAuth } from "./type"
import type { ILoginCredentials } from "../../common/api"

export async function signIn(credentials: ILoginCredentials): Promise<IAuth> {
	const response = await fetch("/api/sign-in", {
		method: "POST",
		headers: createCredentialsHeader(credentials),
	})

	return response.json() as Promise<IAuth>
}

export function createCredentialsHeader({
	username,
	password,
}: ILoginCredentials): Record<string, string> {
	const credentials = Buffer.from(`${username}:${password}`).toString("base64")

	return { authorization: `Basic ${credentials}` }
}
