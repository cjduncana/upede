import { either as E, readerTaskEither as RTE, taskEither as TE } from "fp-ts"
import type { ReaderTaskEither } from "fp-ts/ReaderTaskEither"
import { constant, flow, pipe } from "fp-ts/function"
import * as t from "io-ts"
import { NonEmptyString } from "io-ts-types/NonEmptyString"

import { createHandler, getParseError } from "../../common/api"
import type {
	IConfig,
	IHandler,
	IHandlerOptions,
	IHandlerReader,
	IRestApiError,
} from "../../common/api"
import { filterImages, parseForm } from "../../common/formData"
import { createReportService } from "../../modules/report/service"
import type { INewReport, IReport } from "../../modules/report/type"

const reportService = createReportService("reports.csv")

// POST /api/report: Create a new report

const NewReportParser = t.type(
	{ description: t.tuple([NonEmptyString]) },
	"NewReport",
)

const parseNewReport: ReaderTaskEither<
	IHandlerOptions<IReport>,
	IRestApiError,
	INewReport
> = RTE.asksReaderTaskEither(
	flow(
		({ req }) => parseForm(req)({ multiples: true, filter: filterImages }),
		TE.mapLeft(
			constant<IRestApiError>({
				type: "BadRequestError",
				errors: ["Failed to parse form data"],
			}),
		),
		TE.chainEitherK(
			flow(
				({ fields }) => NewReportParser.decode(fields),
				E.bimap(getParseError, getNewReportFromForm),
			),
		),
		RTE.fromTaskEither,
	),
)

function getNewReportFromForm(
	parsed: t.TypeOf<typeof NewReportParser>,
): INewReport {
	const [description] = parsed.description
	return { description }
}

const createReportHandler: IHandlerReader<IReport> = pipe(
	parseNewReport,
	RTE.chainTaskEitherK(
		flow(
			reportService.create,
			TE.mapLeft(
				constant<IRestApiError>({
					type: "InternalServerError",
					message: "Failed to create Report",
				}),
			),
		),
	),
)

// Glue together all the different methods and their parsers

const handler: IHandler<IReport> = (req, res) =>
	createHandler({ POST: createReportHandler })({ req, res })()

export default handler

export const config: IConfig = { api: { bodyParser: false } }
