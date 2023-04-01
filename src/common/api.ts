import {
	either as E,
	readerIO as RIO,
	readerTask as RT,
	taskEither as TE,
} from "fp-ts"
import { Either } from "fp-ts/Either"
import { ReaderIO } from "fp-ts/ReaderIO"
import type { ReaderTask } from "fp-ts/ReaderTask"
import { ReaderTaskEither } from "fp-ts/ReaderTaskEither"
import { TaskEither } from "fp-ts/TaskEither"
import { flow, pipe } from "fp-ts/function"
import { IncomingHttpHeaders } from "http"
import * as t from "io-ts"
import { PathReporter } from "io-ts/PathReporter"
import { Lens, Optional } from "monocle-ts"
import type { NextApiRequest, NextApiResponse } from "next"

export type {
	NextConfig as IConfig,
	NextApiRequest as IRequest,
	NextApiResponse as IResponse,
} from "next"

export type IHandler<A> = (
	req: NextApiRequest,
	res: NextApiResponse<A | IRestApiError>,
) => Promise<void>

export type IHandlerReader<A> = ReaderTaskEither<
	IHandlerOptions<A>,
	IRestApiError,
	A
>

export function createHandler<A>(
	handlers: Record<string, IHandlerReader<A>>,
): ReaderTask<IHandlerOptions<A>, void> {
	return pipe(
		chooseMethod(handlers),
		RT.chainReaderIOK(
			flow(respondWith, RIO.local(handlerOptionsToResponseLens<A>().get)),
		),
	)
}

function chooseMethod<A>(
	handlers: Record<
		string,
		ReaderTaskEither<IHandlerOptions<A>, IRestApiError, A>
	>,
): ReaderTaskEither<IHandlerOptions<A>, IRestApiError, A> {
	return ({ req, res }): TaskEither<IRestApiError, A> => {
		const handler = req.method && handlers[req.method]
		return handler
			? handler({ req, res })
			: TE.left(createMethodNotAllowedError(Object.keys(handlers), req.method))
	}
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

export interface IHandlerOptions<A> {
	req: NextApiRequest
	res: NextApiResponse<A | IRestApiError>
}

export function handlerOptionsToRequestLens<A>(): Lens<
	IHandlerOptions<A>,
	NextApiRequest
> {
	return Lens.fromProp<IHandlerOptions<A>>()("req")
}

export function handlerOptionsToBodyLens<A>(): Lens<
	IHandlerOptions<A>,
	unknown
> {
	return handlerOptionsToRequestLens<A>().composeLens<unknown>(
		Lens.fromProp<NextApiRequest>()("body"),
	)
}

export const requestToHeadersLens = Lens.fromProp<NextApiRequest>()("headers")
export const requestToAuthorizationHeaderLens =
	requestToHeadersLens.composeOptional(
		Optional.fromNullableProp<IncomingHttpHeaders>()("authorization"),
	)

export function handlerOptionsToResponseLens<A>(): Lens<
	IHandlerOptions<A>,
	NextApiResponse<A | IRestApiError>
> {
	return Lens.fromProp<IHandlerOptions<A>>()("res")
}
