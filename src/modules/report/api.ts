import type { TaskEither } from "fp-ts/TaskEither"
import * as t from "io-ts"
import { NonEmptyString } from "io-ts-types"

import { ReportIdCodec } from "./reportId"
import type { INewReport, IReport } from "./type"
import { fetchTask } from "../../common/fetch"
import type { IFetchError } from "../../common/fetch"

export function createReport(
	newReport: INewReport,
): TaskEither<IFetchError, IReport> {
	const formData = new FormData()

	formData.append("description", newReport.description)

	return fetchTask(
		"/api/report",
		t.type({ id: ReportIdCodec, description: NonEmptyString }).decode,
		{ method: "POST", body: formData },
	)
}
