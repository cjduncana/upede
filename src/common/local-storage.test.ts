/**
 * @jest-environment jest-environment-jsdom-global
 */

import { either as E, option as O } from "fp-ts"
import * as t from "io-ts"
import { JSDOM } from "jsdom"

import * as LocalStorage from "./local-storage"

declare global {
	const jsdom: JSDOM
}

describe("Local Storage", () => {
	const originalLocation = window.location.href

	afterEach(() => {
		jsdom.reconfigure({ url: originalLocation })
		localStorage.clear()
	})

	describe("#getItem", () => {
		it("should return the value of the key", () => {
			localStorage.setItem("key", JSON.stringify({ foo: "bar" }))

			const result = LocalStorage.getItem(
				window,
				"key",
				t.type({ foo: t.string }).decode,
			)()

			expect(
				E.isRight(result) && O.isSome(result.right) && result.right.value,
			).toEqual({ foo: "bar" })
		})

		it("should return nothing if the key does not exist", () => {
			const result = LocalStorage.getItem(
				window,
				"key",
				t.type({ foo: t.string }).decode,
			)()

			expect(E.isRight(result) && O.isNone(result.right)).toBe(true)
		})

		it("should return an error if the local storage is not available", () => {
			jsdom.reconfigure({ url: "file://" })

			const result = LocalStorage.getItem(
				window,
				"key",
				t.type({ foo: t.string }).decode,
			)()

			expect(E.isLeft(result) && result.left).toEqual({
				type: "SecurityError",
				message: "localStorage is not available for opaque origins",
			})
		})
	})

	describe("#setItem", () => {
		it("should set the key", () => {
			const result = LocalStorage.setItem(window, "key", { foo: "bar" })()

			expect(E.isRight(result) && result.right).toBeUndefined()
			expect(localStorage.getItem("key")).toBe(JSON.stringify({ foo: "bar" }))
		})

		it("should return an error if the local storage is not available", () => {
			jsdom.reconfigure({ url: "file://" })

			const result = LocalStorage.setItem(window, "key", { foo: "bar" })()

			expect(E.isLeft(result) && result.left).toEqual({
				type: "SecurityError",
				message: "localStorage is not available for opaque origins",
			})
		})

		it("should return an error if the quota is exceeded", () => {
			const result = LocalStorage.setItem(
				window,
				"key",
				"0".repeat(5_000_000),
			)()

			expect(E.isLeft(result) && result.left).toEqual({
				type: "QuotaExceededError",
				message: "The 5000000-code unit storage quota has been exceeded.",
			})
		})
	})

	describe("#removeItem", () => {
		it("should remove the key", () => {
			localStorage.setItem("key", "value")

			expect(localStorage.getItem("key")).toBe("value")

			const result = LocalStorage.removeItem(window, "key")()

			expect(E.isRight(result) && result.right).toBeUndefined()
			expect(localStorage.getItem("key")).toBeNull()
		})

		it("should return an error if the local storage is not available", () => {
			jsdom.reconfigure({ url: "file://" })

			const result = LocalStorage.removeItem(window, "key")()

			expect(E.isLeft(result) && result.left).toEqual({
				type: "SecurityError",
				message: "localStorage is not available for opaque origins",
			})
		})
	})

	describe("#clear", () => {
		it("should clear the local storage", () => {
			localStorage.setItem("key", "value")

			expect(localStorage.getItem("key")).toBe("value")

			const result = LocalStorage.clear(window)()

			expect(E.isRight(result) && result.right).toBeUndefined()
			expect(localStorage.getItem("key")).toBeNull()
		})

		it("should return an error if the local storage is not available", () => {
			jsdom.reconfigure({ url: "file://" })

			const result = LocalStorage.clear(window)()

			expect(E.isLeft(result) && result.left).toEqual({
				type: "SecurityError",
				message: "localStorage is not available for opaque origins",
			})
		})
	})
})
