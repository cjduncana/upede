import { readerTaskEither as RTE, taskEither as TE } from "fp-ts"
import { pipe } from "fp-ts/function"
import { PathLike } from "fs"

import { randomReportId } from "./reportId"
import { INewReport, IReport, IReportRepository } from "./type"
import { Row, appendRow } from "../../common/csvDocument"

export function createReportRepository(path: PathLike): IReportRepository {
	return { create: (report: INewReport) => createReportReader(report)(path) }
}

function createReportReader(newReport: INewReport): RTE.ReaderTaskEither<PathLike, string, IReport> {
	return (path: PathLike): TE.TaskEither<string, IReport> => {
		return pipe(
			TE.Do,
			TE.bind("id", () => TE.fromIO(randomReportId)),
			TE.let("report", ({ id }) => ({ ...newReport, id })),
			TE.chainFirst(({ report }) => appendRow(report)({ path, encode: encodeReport })),
			TE.map(({ report }) => report),
		)
	}
}

function encodeReport(report: IReport): Row {
	return { id: report.id, description: report.description }
}
