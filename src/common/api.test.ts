import { either as E, taskEither as TE } from "fp-ts"
import type { NextApiRequest, NextApiResponse } from "next"
import { createMocks } from "node-mocks-http"

import * as API from "./api"

describe("API", () => {

	describe("#chooseMethod", () => {

		it("should return the handler for the given method", async () => {

			const handler = API.chooseMethod({
				GET: () => TE.right("GET"),
				POST: () => TE.right("POST"),
			})

			const result = await handler(
				createMocks<NextApiRequest, NextApiResponse>({ method: "GET" }),
			)()

			expect(result).toEqual(E.right("GET"))
		})

		it("should return a MethodNotAllowedError if the method is not allowed", async () => {

			const handler = API.chooseMethod({
				GET: () => TE.right("GET"),
				POST: () => TE.right("POST"),
			})

			const result = await handler(
				createMocks<NextApiRequest, NextApiResponse>({ method: "PUT" }),
			)()

			expect(result).toEqual(E.left({
				type: "MethodNotAllowedError",
				allowedMethods: ["GET", "POST"],
				message: "Method \"PUT\" not allowed",
			}))
		})
	})

	describe("#respondWith", () => {

		it("should return a 200 response with the result", () => {

			const { res } = createMocks<NextApiRequest, NextApiResponse>()

			API.respondWith(E.right("OK"))(res)()

			expect(res._getStatusCode()).toEqual(200)
			expect(res._getJSONData()).toEqual("OK")
		})

		it("should return a 400 response with the error", () => {

			const { res } = createMocks<NextApiRequest, NextApiResponse>()

			API.respondWith(E.left({
				type: "BadRequestError",
				errors: ["Bad request"],
			}))(res)()

			expect(res._getStatusCode()).toEqual(400)
			expect(res._getJSONData()).toEqual({
				type: "BadRequestError",
				errors: ["Bad request"],
			})
		})

		it("should return a 405 response with the error", () => {

			const { res } = createMocks<NextApiRequest, NextApiResponse>()

			API.respondWith(E.left({
				type: "MethodNotAllowedError",
				allowedMethods: ["GET"],
				message: "Method not allowed",
			}))(res)()

			expect(res._getStatusCode()).toEqual(405)
			expect(res._getJSONData()).toEqual({
				type: "MethodNotAllowedError",
				allowedMethods: ["GET"],
				message: "Method not allowed",
			})
		})

		it("should return a 500 response with the error", () => {

			const { res } = createMocks<NextApiRequest, NextApiResponse>()

			API.respondWith(E.left({
				type: "InternalServerError",
				message: "Internal server error",
			}))(res)()

			expect(res._getStatusCode()).toEqual(500)
			expect(res._getJSONData()).toEqual({
				type: "InternalServerError",
				message: "Internal server error",
			})
		})
	})
})
