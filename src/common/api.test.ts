import { readerTaskEither as RTE } from "fp-ts"
import { createMocks } from "node-mocks-http"

import * as API from "./api"

describe("API", () => {
	describe("#createHandler", () => {
		it("should return a 200 response with the result", async () => {
			const { req, res } = createMocks<API.IRequest, API.IResponse>({
				method: "GET",
			})

			await API.createHandler({ GET: RTE.right("OK") })({ req, res })()

			expect(res._getStatusCode()).toEqual(200)
			expect(res._getJSONData()).toEqual("OK")
		})

		it("should return a 400 response with the error", async () => {
			const { req, res } = createMocks<API.IRequest, API.IResponse>({
				method: "GET",
			})

			await API.createHandler({
				GET: RTE.left({
					type: "BadRequestError",
					errors: ["Bad request"],
				}),
			})({ req, res })()

			expect(res._getStatusCode()).toEqual(400)
			expect(res._getJSONData()).toEqual({
				type: "BadRequestError",
				errors: ["Bad request"],
			})
		})

		it("should return a 405 response with the error", async () => {
			const { req, res } = createMocks<API.IRequest, API.IResponse>({
				method: "POST",
			})

			await API.createHandler({ GET: RTE.right("OK") })({ req, res })()

			expect(res._getStatusCode()).toEqual(405)
			expect(res._getJSONData()).toEqual({
				type: "MethodNotAllowedError",
				allowedMethods: ["GET"],
				message: 'Method "POST" not allowed',
			})
		})

		it("should return a 500 response with the error", async () => {
			const { req, res } = createMocks<API.IRequest, API.IResponse>({
				method: "GET",
			})

			await API.createHandler({
				GET: RTE.left({
					type: "InternalServerError",
					message: "Internal server error",
				}),
			})({ req, res })()

			expect(res._getStatusCode()).toEqual(500)
			expect(res._getJSONData()).toEqual({
				type: "InternalServerError",
				message: "Internal server error",
			})
		})
	})
})
