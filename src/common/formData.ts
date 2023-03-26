import formidable from "formidable"
import {
	array as A,
	readerTaskEither as RTE,
	record as R,
	tuple as T,
	taskEither as TE,
} from "fp-ts"
import { flow } from "fp-ts/function"
import type { NextApiRequest } from "next"

export type Fields = Record<string, string[]>
export type Files = Record<string, formidable.File[]>
export type { Options } from "formidable"

export interface Result {
    fields: Fields
    files: Files
}

export function parseForm(req: NextApiRequest): RTE.ReaderTaskEither<formidable.Options, string, Result> {
	return (options) => {
		const form = formidable(options)
		return TE.tryCatch(() => new Promise((resolve, reject) => {
			form.parse(req, (err, fields, files) => {
				if (err) {
					reject(err)
				} else {
					resolve({
						fields: mandateArrays(fields),
						files: mandateArrays(files),
					})
				}
			})
		}), String)
	}
}

export function filterImages({ mimetype }: formidable.Part): boolean {
	return mimetype?.includes("image") ?? false
}

function mandateArrays<K extends string, A>(record: Record<K, A | A[]>): Record<K, A[]> {
	return flow<[Record<K, A | A[]>], [K, A | A[]][], [K, A[]][], Record<K, A[]>>(
		R.toEntries,
		A.map(T.mapSnd(forceArray)),
		R.fromEntries,
	)(record)
}

function forceArray<A>(value: A | A[]): A[] {
	return Array.isArray(value) ? value : A.of(value)
}
