import {
	either as E,
	eq as Eq,
	readerIO as RIO,
	readerTask as RT,
	string as S,
	taskEither as TE,
} from "fp-ts"
import { Either } from "fp-ts/Either"
import { IO } from "fp-ts/IO"
import { ReaderIO } from "fp-ts/ReaderIO"
import type { ReaderTask } from "fp-ts/ReaderTask"
import { ReaderTaskEither } from "fp-ts/ReaderTaskEither"
import { TaskEither } from "fp-ts/TaskEither"
import { constant, flow, pipe } from "fp-ts/function"
import * as t from "io-ts"
import { PathReporter } from "io-ts/PathReporter"
import { Lens, Optional } from "monocle-ts"
import type { NextApiRequest, NextApiResponse } from "next"

export type {
	NextConfig as IConfig,
	NextApiRequest as IRequest,
	NextApiResponse as IResponse,
} from "next"

export type IHandler<Data> = (
	req: NextApiRequest,
	res: NextApiResponse<Data | IRestApiError>,
) => Promise<void>

export type IHandlerReader<Data, Config> = ReaderTaskEither<
	IHandlerOptions<Data> & Config,
	IRestApiError,
	Data
>

const METHOD = {
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	PATCH: "PATCH",
	DELETE: "DELETE",
} as const

export type Method = keyof typeof METHOD

export type IHandlerRecord<Data, Config> = Partial<
	Record<keyof typeof METHOD, IHandlerReader<Data, Config>>
>

export function createHandler<Data, Config>(
	handlers: IHandlerRecord<Data, Config>,
	config: IO<Config>,
): ReaderTask<IHandlerOptions<Data>, void> {
	return pipe(
		chooseMethod(handlers, config),
		RT.chainReaderIOK(flow(respondWith, RIO.local(getResponse))),
	)
}

function chooseMethod<Data, Config>(
	handlers: IHandlerRecord<Data, Config>,
	config: IO<Config>,
): ReaderTaskEither<IHandlerOptions<Data>, IRestApiError, Data> {
	return (handlerOptions): TaskEither<IRestApiError, Data> => {
		const handlerInput: IHandlerOptions<Data> & Config = {
			...handlerOptions,
			...config(),
		}

		const { req } = handlerOptions
		const { method } = req
		const handler = isMethod(method) && handlers[method]

		return handler
			? handler(handlerInput)
			: TE.left(createMethodNotAllowedError(Object.keys(handlers), method))
	}
}

function isMethod(method = ""): method is Method {
	return Object.values(METHOD).includes(method)
}

function respondWith<A>(
	result: Either<IRestApiError, A>,
): ReaderIO<NextApiResponse<A | IRestApiError>, void> {
	return (res) => () =>
		E.fold<IRestApiError, A, null>(
			(error): null => {
				switch (error.type) {
					case "BadRequestError": {
						res.status(400).json(error)
						return null
					}

					case "UnauthorizedError": {
						res.setHeader("WWW-Authenticate", error.challenge)
						res.status(401).json(error)
						return null
					}

					case "MethodNotAllowedError": {
						res.setHeader("Allow", error.allowedMethods)
						res.status(405).json(error)
						return null
					}

					case "InternalServerError": {
						res.status(500).json(error)
						return null
					}
				}
			},
			(value): null => {
				res.status(200).json(value)
				return null
			},
		)(result)
}

interface IBadRequestError {
	type: "BadRequestError"
	errors: string[]
}

export function getParseError(errors: t.Errors): IRestApiError {
	return {
		type: "BadRequestError",
		errors: PathReporter.report(E.left(errors)),
	}
}

interface IUnauthorizedError {
	type: "UnauthorizedError"
	challenge: "Basic" | "Bearer"
	message: string
}

export const failedAuthentication: IUnauthorizedError = {
	type: "UnauthorizedError",
	challenge: "Basic",
	message: "Invalid username or password",
}

interface IMethodNotAllowedError {
	type: "MethodNotAllowedError"
	allowedMethods: string[]
	message: string
}

function createMethodNotAllowedError(
	allowedMethods: string[],
	method?: string,
): IMethodNotAllowedError {
	return {
		type: "MethodNotAllowedError",
		allowedMethods,
		message: method ? `Method "${method}" not allowed` : "Method not allowed",
	}
}

interface IInternalServerError {
	type: "InternalServerError"
	message: string
}

export type IRestApiError =
	| IBadRequestError
	| IUnauthorizedError
	| IMethodNotAllowedError
	| IInternalServerError

export interface IHandlerOptions<Data> {
	req: NextApiRequest
	res: NextApiResponse<Data | IRestApiError>
}

export const AUTHENTICATION_ERROR = {
	NO_AUTHORIZATION_HEADER: "NO_AUTHORIZATION_HEADER",
	WRONG_SCHEME: "WRONG_SCHEME",
	MISSING_CREDENTIALS: "MISSING_CREDENTIALS",
} as const

export type IAuthenticationError = keyof typeof AUTHENTICATION_ERROR

export type ILoginCredentials = {
	username: string
	password: string
}

export const loginCredentialsEq = Eq.struct<ILoginCredentials>({
	username: S.Eq,
	password: S.Eq,
})

export function getLoginCredentials<Data>(
	handlerOptions: IHandlerOptions<Data>,
): Either<IAuthenticationError, ILoginCredentials> {
	return pipe(
		Optional.fromPath<IHandlerOptions<Data>>()([
			"req",
			"headers",
			"authorization",
		]).getOption(handlerOptions),
		E.fromOption(constant(AUTHENTICATION_ERROR.NO_AUTHORIZATION_HEADER)),
		E.chain(validateLoginCredentialsFromHeader),
	)
}

function validateLoginCredentialsFromHeader(
	authorizationHeader: string,
): Either<IAuthenticationError, ILoginCredentials> {
	const [scheme, credentials] = authorizationHeader.split(" ")

	if (scheme !== "Basic") return E.left(AUTHENTICATION_ERROR.WRONG_SCHEME)

	const [username, password] = Buffer.from(credentials, "base64")
		.toString()
		.split(":")

	return username && password
		? E.right({ username, password })
		: E.left(AUTHENTICATION_ERROR.MISSING_CREDENTIALS)
}

function getResponse<Data>(
	handlerOptions: IHandlerOptions<Data>,
): NextApiResponse<Data | IRestApiError> {
	return Lens.fromProp<IHandlerOptions<Data>>()("res").get(handlerOptions)
}
