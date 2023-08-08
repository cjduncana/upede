import { either as E, readerTaskEither as RTE, task as T } from "fp-ts"
import { Either } from "fp-ts/Either"
import { ReaderTaskEither } from "fp-ts/ReaderTaskEither"
import { pipe } from "fp-ts/function"
import { constants as Constants } from "fs"
import * as t from "io-ts"
import { PathReporter } from "io-ts/PathReporter"

import * as fs from "./fs"

type HasPath = { path: string }

type AppendRowConfig<A> = HasPath & {
	encode: t.Encode<A, Row>
}

export type Row = Record<string, string>

export function appendRow<A>(
	value: A,
): ReaderTaskEither<AppendRowConfig<A>, string, void> {
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

type GetRowsConfig<A> = HasPath & {
	decode: t.Decode<Row, A>
}

export function getRows<A>(): ReaderTaskEither<
	GetRowsConfig<A>,
	string,
	readonly A[]
> {
	return pipe(
		RTE.Do,
		RTE.bind("config", () => RTE.ask<GetRowsConfig<A>>()),
		RTE.bind("rows", () => readFile()),
		RTE.chainEitherK(({ config, rows }) => decodeRows(rows, config.decode)),
	)
}

function convertCsvString(value: Row, doesFileExist: boolean): string {
	const row = `\n${Object.values(value).join(",")}`
	return doesFileExist ? row : `${Object.keys(value).join(",")}${row}`
}

function createUnknownError(
	path: string,
	row: Row,
	nodeException: NodeJS.ErrnoException,
): string {
	const rowString = JSON.stringify(row)
	const exceptionString = JSON.stringify(nodeException)

	return `Error appending a Row in "${path}": ${rowString}\n${exceptionString}`
}

function readFile<R extends HasPath>(): ReaderTaskEither<R, string, Row[]> {
	return pipe(
		RTE.ask<HasPath>(),
		RTE.chainTaskEitherK((config) =>
			fs.readFile({ path: config.path, encoding: "utf8" }),
		),
		RTE.bimap(String, parseRows),
	)
}

function parseRows(fileString: string): Row[] {
	const [header, ...rows] = fileString.split("\n")
	const headerKeys = header.split(",")
	return rows.map<Row>((row) => {
		const rowValues = row.split(",")

		return headerKeys.reduce<Row>(
			(acc, key, index) => ({ ...acc, [key]: rowValues[index] }),
			{},
		)
	})
}

function decodeRows<A>(
	rows: Row[],
	decoder: t.Decode<Row, A>,
): Either<string, readonly A[]> {
	return pipe(
		rows,
		E.traverseArray(decoder),
		E.mapLeft((errors) => PathReporter.report(E.left(errors)).join("\n")),
	)
}
