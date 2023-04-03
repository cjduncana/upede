import { either as E, readerTaskEither as RTE } from "fp-ts"
import type { ReaderEither } from "fp-ts/ReaderEither"
import { constant, flow } from "fp-ts/function"

import {
	createHandler,
	failedAuthentication,
	getLoginCredentials,
	loginCredentialsEq,
} from "../../common/api"
import type {
	IHandler,
	IHandlerOptions,
	IHandlerReader,
	ILoginCredentials,
	IRestApiError,
} from "../../common/api"
import { getAdminLoginCredentials, getConfig } from "../../common/config"
import type { IConfig } from "../../common/config"
import type { IAuth } from "../../modules/auth/type"

// POST /api/sign-in: Authenticate a user

const signInHandler: IHandlerReader<IAuth, IConfig> = RTE.asksReaderTaskEither<
	IConfig & IHandlerOptions<IAuth>,
	IRestApiError,
	IAuth
>(
	flow(
		getLoginCredentials,
		E.mapLeft(constant(failedAuthentication)),
		RTE.fromEither,
		RTE.chainReaderEitherKW(credentialsReader),
	),
)

function credentialsReader(
	credentialsFromRequest: ILoginCredentials,
): ReaderEither<IConfig, IRestApiError, IAuth> {
	return flow(
		getAdminLoginCredentials,
		E.fromOption(constant(failedAuthentication)),
		E.chain(verifyCredentials(credentialsFromRequest)),
	)
}

function verifyCredentials(
	credentialsFromRequest: ILoginCredentials,
): ReaderEither<ILoginCredentials, IRestApiError, IAuth> {
	return (adminCredentials) =>
		loginCredentialsEq.equals(credentialsFromRequest, adminCredentials)
			? E.right({
					username: credentialsFromRequest.username,
					jwtToken: credentialsFromRequest.password,
			  })
			: E.left(failedAuthentication)
}

// Glue together all the different methods and their parsers

const handler: IHandler<IAuth> = (req, res) =>
	createHandler(
		{
			POST: signInHandler,
		},
		getConfig,
	)({ req, res })()

export default handler
