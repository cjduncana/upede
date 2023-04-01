import { either as E, readerTaskEither as RTE } from "fp-ts"
import type { Either } from "fp-ts/Either"
import { constant, flow } from "fp-ts/function"

import { createHandler, failedAuthentication, handlerOptionsToRequestLens, requestToAuthorizationHeaderLens } from "../../common/api"
import type { IHandler, IHandlerReader, IRestApiError } from "../../common/api"
import { IAuth } from "../../modules/auth/type"

const correctUsername = "admin"
const correctPassword = "admin"

// POST /api/sign-in: Authenticate a user

const extractCredentialsFromHeader = (authorizationHeader: string): string[] =>
	Buffer.from(authorizationHeader.replace("Basic ", ""), "base64").toString().split(":")

const verifyCredentials = ([username, password]: string[]): Either<IRestApiError, IAuth> =>
	(username === correctUsername && password === correctPassword)
		? E.right({ username, jwtToken: password })
		: E.left(failedAuthentication)

const signInHandler: IHandlerReader<IAuth> = RTE.asksReaderTaskEither(flow(
	handlerOptionsToRequestLens<IAuth>()
		.composeOptional(requestToAuthorizationHeaderLens)
		.getOption,
	E.fromOption(constant(failedAuthentication)),
	E.chain(flow(extractCredentialsFromHeader, verifyCredentials)),
	RTE.fromEither,
))

// Glue together all the different methods and their parsers

const handler: IHandler<IAuth> = (req, res) =>
	createHandler<IAuth>({ POST: signInHandler })({ req, res })()

export default handler
