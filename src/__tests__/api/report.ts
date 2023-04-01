import mock from "mock-fs"
import { createMocks } from "node-mocks-http"

import type { IRequest, IResponse } from "../../common/api"
import reportHandler from "../../pages/api/report"

describe("Report Handler", () => {

	// TODO: Skipping these tests for now until I figure out how to test upload
	// functionality
	describe.skip("POST", () => {

		beforeEach(() => mock())

		afterEach(mock.restore)

		it("should succeed if given the correct input", async () => {

			const { req, res } = createMocks<IRequest, IResponse>({
				method: "POST",
				body: { description: "Test" },
			})

			await reportHandler(req, res)

			expect(res._getStatusCode()).toBe(200)
			expect(res._getJSONData()).toEqual({ id: expect.any(String), description: "Test" })
		})

		it("should fail if description is missing", async () => {

			const { req, res } = createMocks<IRequest, IResponse>({
				method: "POST",
				body: {},
			})

			await reportHandler(req, res)

			expect(res._getStatusCode()).toBe(400)
			expect(res._getJSONData()).toEqual({
				type: "BadRequestError",
				errors: ["Invalid value undefined supplied to : NewReport/description: NonEmptyString"],
			})
		})

		it("should fail if an unexpected error occurred", async () => {

			mock({ "reports.csv": mock.file({ mode: 0o0_0_0 }) })

			const { req, res } = createMocks<IRequest, IResponse>({
				method: "POST",
				body: { description: "Test" },
			})

			await reportHandler(req, res)

			expect(res._getStatusCode()).toBe(500)
			expect(res._getJSONData()).toEqual({
				type: "InternalServerError",
				message: "Failed to create Report",
			})
		})
	})

	it("should fail if the method is not allowed", async () => {

		const { req, res } = createMocks<IRequest, IResponse>({ method: "GET" })

		await reportHandler(req, res)

		expect(res._getStatusCode()).toBe(405)
		expect(res._getJSONData()).toEqual({
			type: "MethodNotAllowedError",
			allowedMethods: ["POST"],
			message: "Method \"GET\" not allowed",
		})
	})
})
