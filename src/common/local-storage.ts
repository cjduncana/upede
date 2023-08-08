import { either as E, ioEither as IOE, option as O } from "fp-ts"
import type { IOEither } from "fp-ts/IOEither"
import type { Option } from "fp-ts/Option"
import { pipe } from "fp-ts/function"
import * as t from "io-ts"
import { PathReporter } from "io-ts/PathReporter"

export function getItem<Data>(
	window: Window,
	key: string,
	decode: t.Decode<unknown, Data>,
): IOEither<IGetItemError, Option<Data>> {
	return pipe(
		IOE.tryCatch(
			() => window.localStorage.getItem(key),
			parseLocalStorageError,
		),
		IOE.chainEitherKW((value) => {
			if (value === null) return E.right(O.none)

			return pipe(
				decode(JSON.parse(value)),
				E.bimap(
					(errors) => ({
						type: LocalStorageErrorType.DecoderError,
						errors: PathReporter.report(E.left(errors)),
						value,
					}),
					O.some,
				),
			)
		}),
	)
}

export function setItem(
	window: Window,
	key: string,
	data: unknown,
): IOEither<ISetItemError, void> {
	return IOE.tryCatch(
		() => window.localStorage.setItem(key, JSON.stringify(data)),
		parseSetItemError,
	)
}

export function removeItem(
	window: Window,
	key: string,
): IOEither<ILocalStorageError, void> {
	return IOE.tryCatch(
		() => window.localStorage.removeItem(key),
		parseLocalStorageError,
	)
}

export function clear(window: Window): IOEither<ILocalStorageError, void> {
	return IOE.tryCatch(() => window.localStorage.clear(), parseLocalStorageError)
}

const LocalStorageErrorType = {
	SecurityError: "SecurityError",
	QuotaExceededError: "QuotaExceededError",
	DecoderError: "DecoderError",
	UnknownError: "UnknownError",
} as const

type ISecurityError = {
	type: "SecurityError"
	message: string
}

type IQuotaExceededError = {
	type: "QuotaExceededError"
	message: string
}

type IDecoderError = {
	type: "DecoderError"
	errors: string[]
	value: string
}

type IUnknownError = {
	type: "UnknownError"
	message: string
	error?: Error
}

type ILocalStorageError = ISecurityError | IUnknownError

export type IGetItemError = ILocalStorageError | IDecoderError

export type ISetItemError = ILocalStorageError | IQuotaExceededError

function parseLocalStorageError(error: unknown): ILocalStorageError {
	if (error instanceof DOMException && error.name === "SecurityError") {
		return {
			type: LocalStorageErrorType.SecurityError,
			message: error.message,
		}
	}

	if (error instanceof Error) {
		return {
			type: LocalStorageErrorType.UnknownError,
			message: error.message,
			error,
		}
	}

	return { type: LocalStorageErrorType.UnknownError, message: String(error) }
}

function parseSetItemError(error: unknown): ISetItemError {
	if (error instanceof DOMException && error.name === "QuotaExceededError") {
		return {
			type: LocalStorageErrorType.QuotaExceededError,
			message: error.message,
		}
	}

	return parseLocalStorageError(error)
}
