import { IAuth } from "./type"

export async function signIn(
	username: string,
	password: string,
): Promise<IAuth> {
	const credentials = Buffer.from(`${username}:${password}`).toString("base64")

	const response = await fetch("/api/sign-in", {
		method: "POST",
		headers: { authorization: `Basic ${credentials}` },
	})

	return response.json() as Promise<IAuth>
}
