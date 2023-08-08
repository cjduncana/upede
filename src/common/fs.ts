import {
	readerTask as RT,
	readerTaskEither as RTE,
	taskEither as TE,
} from "fp-ts"
import { constFalse, constTrue, flow } from "fp-ts/function"
import * as fs from "fs"

type NodeReaderTaskEither<R, A> = RTE.ReaderTaskEither<
	R,
	NodeJS.ErrnoException,
	A
>

interface AppendFileConfig {
	path: fs.PathOrFileDescriptor
	options?: fs.WriteFileOptions
}

export function appendFile(
	data: string | Uint8Array,
): NodeReaderTaskEither<AppendFileConfig, void> {
	return ({ path, options = {} }: AppendFileConfig) =>
		TE.taskify<
			fs.PathOrFileDescriptor,
			string | Uint8Array,
			fs.WriteFileOptions,
			NodeJS.ErrnoException,
			void
		>(fs.appendFile)(path, data, options)
}

interface AccessFileConfig {
	path: string
	mode?: number
}

export const doesFileExist: RT.ReaderTask<AccessFileConfig, boolean> = flow(
	({ path, mode }: AccessFileConfig) =>
		TE.taskify<string, number | undefined, NodeJS.ErrnoException, void>(
			fs.access,
		)(path, mode),
	TE.match(constFalse, constTrue),
)

interface ReadFileConfig {
	path: string
	encoding: BufferEncoding
}

export const readFile: NodeReaderTaskEither<ReadFileConfig, string> = flow(
	({ path, encoding }: ReadFileConfig) =>
		TE.taskify<
			string,
			{ encoding: BufferEncoding },
			NodeJS.ErrnoException,
			string
		>(fs.readFile)(path, { encoding }),
)
