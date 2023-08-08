import {
	readonlyArray as RA,
	readerTaskEither as RTE,
	taskEither as TE,
} from "fp-ts"
import { Predicate } from "fp-ts/Predicate"
import { TaskEither } from "fp-ts/TaskEither"
import { pipe } from "fp-ts/function"
import * as t from "io-ts"
import { NonEmptyString } from "io-ts-types"

import { ReportIdCodec, randomReportId } from "./reportId"
import type { ReportId } from "./reportId"
import { ReportServiceErrorType } from "./type"
import type {
	IGetByIdReportError,
	INewReport,
	IReport,
	IReportRepository,
} from "./type"
import { appendRow, getRows } from "../../common/csvDocument"

export function createReportRepository(path: string): IReportRepository {
	return {
		create: (report: INewReport) => createReportReader(report)(path),
		getById: (id: ReportId) => getByIdReportReader(id)(path),
	}
}

function createReportReader(
	newReport: INewReport,
): RTE.ReaderTaskEither<string, string, IReport> {
	return (path: string): TaskEither<string, IReport> => {
		return pipe(
			TE.Do,
			TE.bind("id", () => TE.fromIO(randomReportId)),
			TE.let("report", ({ id }) => ({ ...newReport, id })),
			TE.chainFirst(({ report }) =>
				appendRow<IReport>(report)({
					path,
					encode: ReportCodec.encode,
				}),
			),
			TE.map(({ report }) => report),
		)
	}
}

function getByIdReportReader(
	id: ReportId,
): RTE.ReaderTaskEither<string, IGetByIdReportError, IReport> {
	return (path: string): TE.TaskEither<IGetByIdReportError, IReport> => {
		return pipe(
			getRows<IReport>()({
				path,
				decode: ReportCodec.decode,
			}),
			TE.mapLeft<string, IGetByIdReportError>((message) => ({
				type: ReportServiceErrorType.UnknownError,
				message,
			})),
			TE.chainOptionK<IGetByIdReportError>(() => ({
				type: ReportServiceErrorType.NotFoundError,
			}))(RA.findFirst<IReport>(findById(id))),
		)
	}
}

function findById(id: ReportId): Predicate<IReport> {
	return (report: IReport) => report.id === id
}

const ReportCodec = t.type({
	id: ReportIdCodec,
	description: NonEmptyString,
})
