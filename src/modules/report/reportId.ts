import { randomUUID } from "crypto"
import * as t from "io-ts"
import { UUID } from "io-ts-types/UUID"

interface ReportIdBrand {
	readonly ReportId: unique symbol
}

export type ReportId = t.Branded<UUID, ReportIdBrand>

export const ReportIdCodec = t.brand(
	UUID,
	(s): s is ReportId => Boolean(s),
	"ReportId",
)

export function randomReportId(): ReportId {
	return randomUUID() as ReportId
}
