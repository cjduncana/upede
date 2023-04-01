import type { TaskEither } from "fp-ts/TaskEither"
import type { NonEmptyString } from "io-ts-types"

import type { ReportId } from "./reportId"

export interface IReport {
	id: ReportId
	description: NonEmptyString
}

export type INewReport = Omit<IReport, "id">

export interface IReportService {
	create(report: INewReport): TaskEither<string, IReport>
}

export interface IReportRepository {
	create(report: INewReport): TaskEither<string, IReport>
}
