import { IAuth } from "./type"

export async function signIn(username: string, password: string): Promise<IAuth> {
	const response = await fetch("/api/sign-in", {
		method: "POST",
		headers: { authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}` },
	})

	return response.json() as Promise<IAuth>
}
