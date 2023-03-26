import { either as E, readerTaskEither as RTE, taskEither as TE } from "fp-ts"
import { flow } from "fp-ts/lib/function"
import * as t from "io-ts"
import { PathReporter } from "io-ts/PathReporter"
import { NonEmptyString } from "io-ts-types/lib/NonEmptyString"
import type { NextConfig, NextApiRequest, NextApiResponse } from "next"

import { HandlerOptions, RestApiError, chooseMethod, respondWith } from "../../common/api"
import { filterImages, parseForm, Result } from "../../common/formData"
import { createReportService } from "../../modules/report/service"
import { INewReport, IReport } from "../../modules/report/type"

const reportService = createReportService("reports.csv")

// POST /api/report: Create a new report

const NewReportParser = t.type({ description: NonEmptyString }, "NewReport")

const parseNewReport: RTE.ReaderTaskEither<HandlerOptions<IReport>, RestApiError, INewReport> = RTE.asksReaderTaskEither(flow(
	({ req }) => parseForm(req)({ multiples: true, filter: filterImages }),
	TE.mapLeft<string, RestApiError>(()=>({ type: "BadRequestError", errors: ["Failed to parse form data"] })),
	TE.chainEitherK<RestApiError, Result, INewReport>(flow(
		({ fields }) => NewReportParser.decode(fields),
		E.mapLeft<t.Errors, RestApiError>(errors=>({ type: "BadRequestError", errors: PathReporter.report(E.left(errors)) })),
	)),
	RTE.fromTaskEither,
))

const createReport = flow(
	reportService.create,
	TE.mapLeft<string, RestApiError>(()=>({ type: "InternalServerError", message: "Failed to create Report" })),
)

// Glue together all the different methods and their parsers

const allowedMethods = chooseMethod<IReport>({ POST: RTE.chainTaskEitherK(createReport)(parseNewReport) })

export default async function handler(req: NextApiRequest, res: NextApiResponse<IReport | RestApiError>): Promise<void> {
	const result = await allowedMethods({ req, res })()
	respondWith(result)(res)()
}

export const config: NextConfig = { api: { bodyParser: false } }
