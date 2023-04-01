import * as t from "io-ts"
import { UUID } from "io-ts-types/lib/UUID"
import { v4, validate } from "uuid"

interface ReportIdBrand {
	readonly ReportId: unique symbol
}

export type ReportId = t.Branded<UUID, ReportIdBrand>

export const ReportId = t.brand(
	UUID,
	(s): s is ReportId => validate(s),
	"ReportId",
)

export function randomReportId(): ReportId {
	return v4() as ReportId
}
