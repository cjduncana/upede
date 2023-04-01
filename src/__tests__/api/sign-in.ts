import { createMocks } from "node-mocks-http"

import type { IRequest, IResponse } from "../../common/api"
import signInHandler from "../../pages/api/sign-in"

describe("Sign In Handler", () => {

	describe("POST", () => {

		it("should succeed if given the correct input", async () => {

			const username = "admin"
			const password = "admin"

			const { req, res } = createMocks<IRequest, IResponse>({
				method: "POST",
				headers: { authorization: Buffer.from(`${username}:${password}`).toString("base64") },
			})

			await signInHandler(req, res)

			expect(res._getStatusCode()).toBe(200)
			expect(res._getJSONData()).toEqual({ username, jwtToken: password })
		})

		it("should fail if username doesn't match", async () => {

			const username = "not-admin"
			const password = "admin"

			const { req, res } = createMocks<IRequest, IResponse>({
				method: "POST",
				headers: { authorization: Buffer.from(`${username}:${password}`).toString("base64") },
			})

			await signInHandler(req, res)

			expect(res._getStatusCode()).toBe(401)
			expect(res._getJSONData()).toEqual({
				type: "UnauthorizedError",
				challenge: "Basic",
				message: "Invalid username or password",
			})
		})

		it("should fail if password doesn't match", async () => {

			const username = "admin"
			const password = "not-admin"

			const { req, res } = createMocks<IRequest, IResponse>({
				method: "POST",
				headers: { authorization: Buffer.from(`${username}:${password}`).toString("base64") },
			})

			await signInHandler(req, res)

			expect(res._getStatusCode()).toBe(401)
			expect(res._getJSONData()).toEqual({
				type: "UnauthorizedError",
				challenge: "Basic",
				message: "Invalid username or password",
			})
		})
	})

	it("should fail if the method is not allowed", async () => {

		const { req, res } = createMocks<IRequest, IResponse>({ method: "GET" })

		await signInHandler(req, res)

		expect(res._getStatusCode()).toBe(405)
		expect(res._getJSONData()).toEqual({
			type: "MethodNotAllowedError",
			allowedMethods: ["POST"],
			message: "Method \"GET\" not allowed",
		})
	})
})
