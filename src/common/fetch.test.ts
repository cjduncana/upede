import { either as E } from "fp-ts"
import * as t from "io-ts"
import fetchMock from "jest-fetch-mock"

import * as Fetch from "./fetch"

describe("Fetch", () => {
	beforeEach(() => {
		fetchMock.resetMocks()
	})

	it("should parse a JSON response", async () => {
		fetchMock.once(JSON.stringify({ foo: "bar" }))

		const result = await Fetch.fetchTask(
			"https://example.com",
			t.type({ foo: t.string }).decode,
		)()

		expect(E.isRight(result) && result.right).toEqual({ foo: "bar" })
	})

	it("should abort the request", async () => {
		fetchMock.once(JSON.stringify({ foo: "bar" }))

		const controller = new AbortController()
		controller.abort()

		const result = await Fetch.fetchTask(
			"https://example.com",
			t.type({ foo: t.string }).decode,
			{ signal: controller.signal },
		)()

		expect(E.isLeft(result) && result.left).toEqual({
			type: "AbortError",
			message: "The operation was aborted.",
		})
	})

	it("should return an error", async () => {
		fetchMock.mockRejectOnce(new Error("test"))

		const result = await Fetch.fetchTask(
			"https://example.com",
			t.type({ foo: t.string }).decode,
		)()

		expect(E.isLeft(result) && result.left).toEqual({
			type: "UnknownError",
			message: "test",
			error: expect.any(Error),
		})
	})

	it("should return a coerced error", async () => {
		fetchMock.mockRejectOnce(() => Promise.reject("test"))

		const result = await Fetch.fetchTask(
			"https://example.com",
			t.type({ foo: t.string }).decode,
		)()

		expect(E.isLeft(result) && result.left).toEqual({
			type: "UnknownError",
			message: "test",
		})
	})

	it("should return an error if the JSON can't be parsed", async () => {
		fetchMock.once("invalid json")

		const result = await Fetch.fetchTask(
			"https://example.com",
			t.type({ foo: t.string }).decode,
		)()

		expect(E.isLeft(result) && result.left).toEqual({
			type: "JsonError",
			message:
				"invalid json response body at  reason: Unexpected token i in JSON at position 0",
			json: "invalid json",
		})
	})

	it("should return an error if the JSON can't be decoded", async () => {
		fetchMock.once(JSON.stringify({ foo: 123 }))

		const result = await Fetch.fetchTask(
			"https://example.com",
			t.type({ foo: t.string }).decode,
		)()

		expect(E.isLeft(result) && result.left).toEqual({
			type: "DecoderError",
			errors: ["Invalid value 123 supplied to : { foo: string }/foo: string"],
		})
	})

	it("should return a Bad Request error", async () => {
		fetchMock.once(
			JSON.stringify({ type: "BadRequestError", errors: ["bad request"] }),
			{
				status: 400,
			},
		)

		const result = await Fetch.fetchTask(
			"https://example.com",
			t.type({ foo: t.string }).decode,
		)()

		expect(E.isLeft(result) && result.left).toEqual({
			type: "ApiError",
			status: 400,
			error: { type: "BadRequestError", errors: ["bad request"] },
		})
	})

	it("should return an Unauthorized error", async () => {
		fetchMock.once(
			JSON.stringify({
				type: "UnauthorizedError",
				challenge: "Basic",
				message: "unauthorized",
			}),
			{
				status: 401,
			},
		)

		const result = await Fetch.fetchTask(
			"https://example.com",
			t.type({ foo: t.string }).decode,
		)()

		expect(E.isLeft(result) && result.left).toEqual({
			type: "ApiError",
			status: 401,
			error: {
				type: "UnauthorizedError",
				challenge: "Basic",
				message: "unauthorized",
			},
		})
	})

	it("should return a Method Not Allowed error", async () => {
		fetchMock.once(
			JSON.stringify({
				type: "MethodNotAllowedError",
				allowedMethods: ["POST"],
				message: "method not allowed",
			}),
			{
				status: 405,
			},
		)

		const result = await Fetch.fetchTask(
			"https://example.com",
			t.type({ foo: t.string }).decode,
		)()

		expect(E.isLeft(result) && result.left).toEqual({
			type: "ApiError",
			status: 405,
			error: {
				type: "MethodNotAllowedError",
				allowedMethods: ["POST"],
				message: "method not allowed",
			},
		})
	})

	it("should return an Internal Server Error", async () => {
		fetchMock.once(
			JSON.stringify({
				type: "InternalServerError",
				message: "internal server error",
			}),
			{
				status: 500,
			},
		)

		const result = await Fetch.fetchTask(
			"https://example.com",
			t.type({ foo: t.string }).decode,
		)()

		expect(E.isLeft(result) && result.left).toEqual({
			type: "ApiError",
			status: 500,
			error: {
				type: "InternalServerError",
				message: "internal server error",
			},
		})
	})
})
