import { either as E, taskEither as TE } from "fp-ts"
import { Either } from "fp-ts/Either"
import { ReaderIO } from "fp-ts/ReaderIO"
import { ReaderTaskEither } from "fp-ts/ReaderTaskEither"
import { TaskEither } from "fp-ts/TaskEither"
import type { NextApiRequest, NextApiResponse } from "next"

export function chooseMethod<A>(handlers: Record<string, ReaderTaskEither<HandlerOptions<A>, RestApiError, A>>): ReaderTaskEither<HandlerOptions<A>, RestApiError, A> {
	return ({ req, res }): TaskEither<RestApiError, A> => {
		const handler = req.method && handlers[req.method]
		return handler
			? handler({ req, res })
			: TE.left(createMethodNotAllowedError(Object.keys(handlers), req.method))
	}
}

export function respondWith<A>(result: Either<RestApiError, A>): ReaderIO<NextApiResponse<A | RestApiError>, null> {
	return (res) => () =>
		E.fold<RestApiError, A, null>(
			(error): null => {
				switch (error.type) {
					case "BadRequestError": {
						res.status(400).json(error)
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

interface BadRequestError {
    type: "BadRequestError"
    errors: string[]
}

interface MethodNotAllowedError {
    type: "MethodNotAllowedError"
    allowedMethods: string[]
    message: string
}

function createMethodNotAllowedError(allowedMethods:string[], method?: string): MethodNotAllowedError {
	return {
		type: "MethodNotAllowedError",
		allowedMethods,
		message: method ? `Method "${method}" not allowed` : "Method not allowed",
	}
}

interface InternalServerError {
    type: "InternalServerError"
    message: string
}

export type RestApiError = BadRequestError | MethodNotAllowedError | InternalServerError

export interface HandlerOptions<A> {
	req: NextApiRequest
	res: NextApiResponse<A | RestApiError>
}
