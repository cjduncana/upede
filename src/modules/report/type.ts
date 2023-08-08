import type { TaskEither } from "fp-ts/TaskEither"
import type { NonEmptyString } from "io-ts-types"

import type { ReportId } from "./reportId"

export interface IReport {
	id: ReportId
	description: NonEmptyString
}

export type INewReport = Omit<IReport, "id">

export const ReportServiceErrorType = {
	NotFoundError: "NotFoundError",
	UnknownError: "UnknownError",
} as const

type INotFoundError = {
	type: "NotFoundError"
}

type IUnknownError = {
	type: "UnknownError"
	message: string
	error?: Error
}

export type IGetByIdReportError = INotFoundError | IUnknownError

export interface IReportService {
	create(report: INewReport): TaskEither<string, IReport>
	getById(id: ReportId): TaskEither<IGetByIdReportError, IReport>
}

export interface IReportRepository {
	create(report: INewReport): TaskEither<string, IReport>
	getById(id: ReportId): TaskEither<IGetByIdReportError, IReport>
}
