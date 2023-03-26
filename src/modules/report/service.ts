import { reader as R } from "fp-ts"
import { PathLike } from "fs"

import { createReportRepository } from "./csvRepository"
import { IReportService } from "./type"

export const createReportService: R.Reader<PathLike, IReportService> = createReportRepository
