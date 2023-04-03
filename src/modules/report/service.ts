import { reader as R } from "fp-ts"

import { createReportRepository } from "./csvRepository"
import { IReportService } from "./type"

export const createReportService: R.Reader<string, IReportService> =
	createReportRepository
