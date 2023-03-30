import formidable from "formidable"
import type { File, Options } from "formidable"
import {
	record as R,
	taskEither as TE,
} from "fp-ts"
import type { ReaderTaskEither } from "fp-ts/ReaderTaskEither"
import type { IncomingMessage } from "http"

export type { File, Options } from "formidable"

export interface Result {
    fields: Record<string, string[]>
    files: Record<string, File[]>
}

export function parseForm(req: IncomingMessage): ReaderTaskEither<Options, string, Result> {
	return (options) => {
		const form = formidable(options)
		return TE.tryCatch(() => new Promise((resolve, reject) => {
			form.parse(req, (err, fields, files) => {
				if (err) {
					reject(err)
				} else {
					resolve({
						fields: R.map<string | string[], string[]>(forceArray)(fields),
						files: R.map<File | File[], File[]>(forceArray)(files),
					})
				}
			})
		}), String)
	}
}

export function filterImages({ mimetype }: formidable.Part): boolean {
	return mimetype?.includes("image") ?? false
}

function forceArray<A>(value: A | A[]): A[] {
	return Array.isArray(value) ? value : [value]
}
