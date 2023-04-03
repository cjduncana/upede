import { apply as A, ioOption as IOO, option as O } from "fp-ts"
import { Apply as IOApply, map as ioMap } from "fp-ts/IO"
import type { IO } from "fp-ts/IO"
import type { IOOption } from "fp-ts/IOOption"
import type { Option } from "fp-ts/Option"
import type { Predicate } from "fp-ts/Predicate"
import { Optional } from "monocle-ts"

import { ILoginCredentials } from "./api"

export type IConfig = {
	adminLoginCredentials: Option<ILoginCredentials>
	reportCsvPath: Option<string>
	isDevelopment: boolean
}

const configOptional = Optional.fromOptionProp<IConfig>()

const adminLoginCredentialsOptional = configOptional("adminLoginCredentials")
export const getAdminLoginCredentials = adminLoginCredentialsOptional.getOption

const reportCsvPathOptional = configOptional("reportCsvPath")
export const getReportCsvPath = reportCsvPathOptional.getOption

type NodeEnv = NodeJS.ProcessEnv["NODE_ENV"]

const getNodeEnvironment: IO<NodeEnv> = () => process.env.NODE_ENV

export const getConfig: IO<IConfig> = A.sequenceS(IOApply)({
	adminLoginCredentials: A.sequenceS(IOO.Apply)({
		username: getFromEnv("ADMIN_USERNAME"),
		password: getFromEnv("ADMIN_PASSWORD"),
	}),
	reportCsvPath: getFromEnv("REPORT_CSV_PATH"),
	isDevelopment: ioMap(isNodeEnv("development"))(getNodeEnvironment),
})

function isNodeEnv(environment: NodeEnv): Predicate<NodeEnv> {
	return (actualEnvironment) => actualEnvironment === environment
}

function getFromEnv(key: string): IOOption<string> {
	return () => O.fromNullable(process.env[key])
}
