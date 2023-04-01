import { readerTaskEither as RTE, task as T } from "fp-ts"
import { pipe } from "fp-ts/function"
import { PathLike, constants as Constants } from "fs"

import * as fs from "./fs"

interface AppendRowConfig<A> {
	path: PathLike
	encode(value: A): Row
}

export type Row = Record<string, string>

export function appendRow<A>(
	value: A,
): RTE.ReaderTaskEither<AppendRowConfig<A>, string, void> {
	return pipe(
		RTE.Do,
		RTE.bind("config", () => RTE.ask<AppendRowConfig<A>>()),
		RTE.bind("doesFileExist", ({ config }) =>
			RTE.fromTask(
				fs.doesFileExist({ path: config.path, mode: Constants.W_OK }),
			),
		),
		RTE.let("rowString", ({ config, doesFileExist }) =>
			convertCsvString(config.encode(value), doesFileExist),
		),
		RTE.chainTaskEitherK(({ config, rowString }) =>
			fs.appendFile(rowString)({ path: config.path }),
		),
		RTE.orLeft(
			(nodeException) => (config) =>
				T.of(
					createUnknownError(config.path, config.encode(value), nodeException),
				),
		),
	)
}

function convertCsvString(value: Row, doesFileExist: boolean): string {
	const row = `\n${Object.values(value).join(",")}`
	return doesFileExist ? row : `${Object.keys(value).join(",")}${row}`
}

function createUnknownError(
	path: PathLike,
	row: Row,
	nodeException: NodeJS.ErrnoException,
): string {
	const rowString = JSON.stringify(row)
	const exceptionString = JSON.stringify(nodeException)

	return `Error appending a Row in "${path}": ${rowString}\n${exceptionString}`
}
