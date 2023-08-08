import { either as E, taskEither as TE } from "fp-ts"
import type { TaskEither } from "fp-ts/TaskEither"
import { flow, identity, pipe } from "fp-ts/function"
import * as t from "io-ts"
import { PathReporter } from "io-ts/PathReporter"

import { RestApiError } from "./api"
import type { IRestApiError } from "./api"

const IFetchErrorType = {
	ApiError: "ApiError",
	JsonError: "JsonError",
	DecoderError: "DecoderError",
	AbortError: "AbortError",
	UnknownError: "UnknownError",
} as const

export type IFetchError =
	| {
			type: "ApiError"
			status: number
			error: IRestApiError
	  }
	| {
			type: "JsonError"
			message: string
			json: string
	  }
	| {
			type: "DecoderError"
			errors: string[]
	  }
	| {
			type: "AbortError"
			message: string
	  }
	| {
			type: "UnknownError"
			message: string
			error?: Error
	  }

export function fetchTask<Data>(
	input: URL | RequestInfo,
	decode: t.Decode<unknown, Data>,
	init?: RequestInit,
): TaskEither<IFetchError, Data> {
	return pipe(
		_fetch(input, init),
		TE.chainFirst(parseNetworkError),
		TE.chain(toJson),
		TE.chainEitherK(flow(decode, E.mapLeft(getDecoderError))),
	)
}

function _fetch(
	input: URL | RequestInfo,
	init?: RequestInit,
): TaskEither<IFetchError, Response> {
	return TE.tryCatch(() => fetch(input, init), parseFetchError)
}

function toJson(response: Response): TaskEither<IFetchError, unknown> {
	const responseClone = response.clone()

	return pipe(
		TE.tryCatch(() => response.json(), identity),
		TE.orElse<unknown, unknown, IFetchError>((error) =>
			pipe(
				TE.tryCatch(() => responseClone.text(), identity),
				TE.mapLeft(() => parseFetchError(error)),
				TE.chainEitherK((text) =>
					E.left<IFetchError>({
						type: IFetchErrorType.JsonError,
						message: error instanceof Error ? error.message : String(error),
						json: text,
					}),
				),
			),
		),
	)
}

function parseNetworkError(response: Response): TaskEither<IFetchError, void> {
	if (response.ok) return TE.of(undefined)

	return pipe(
		toJson(response),
		TE.chainEitherK(
			flow(
				RestApiError.decode,
				E.mapLeft(getDecoderError),
				E.chain((error) =>
					E.left<IFetchError>({
						type: IFetchErrorType.ApiError,
						status: response.status,
						error,
					}),
				),
			),
		),
	)
}

function parseFetchError(error: unknown): IFetchError {
	if (error instanceof DOMException && error.name === "AbortError") {
		return { type: IFetchErrorType.AbortError, message: error.message.trim() }
	}

	if (error instanceof Error) {
		return {
			type: IFetchErrorType.UnknownError,
			message: error.message,
			error,
		}
	}

	return { type: IFetchErrorType.UnknownError, message: String(error) }
}

function getDecoderError(errors: t.Errors): IFetchError {
	return {
		type: IFetchErrorType.DecoderError,
		errors: PathReporter.report(E.left(errors)),
	}
}
