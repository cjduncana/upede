import { Button, ImageList, ImageListItem, useMediaQuery } from "@mui/material"
import { Theme, useTheme } from "@mui/material/styles"
import { SystemStyleObject } from "@mui/system"
import { option as O, taskEither as TE } from "fp-ts"
import { pipe } from "fp-ts/function"
import { Optional } from "monocle-ts"
import type {
	GetServerSideProps,
	GetServerSidePropsContext,
	GetServerSidePropsResult,
} from "next"
import Link from "next/link"
import React from "react"

import { getConfig } from "../../common/config"
import { TextInput } from "../../component/text-input"
import { ReportIdCodec } from "../../modules/report/reportId"
import { createReportService } from "../../modules/report/service"
import { IReport } from "../../modules/report/type"

export default function Report(props: Props): JSX.Element {
	const theme = useTheme()
	const matchDownMd = useMediaQuery(theme.breakpoints.down("sm"))

	const [fileList] = React.useState<File[]>([])

	return (
		<React.Fragment>
			<Button
				variant="contained"
				size="small"
				sx={signInButtonStyle}
				LinkComponent={Link}
				href="/"
			>
				Create a New Report
			</Button>
			<ImageList cols={matchDownMd ? 1 : 2}>
				{fileList.map((file, index) => (
					<ImageListItem key={index}>
						{/* eslint-disable-next-line @next/next/no-img-element*/}
						<img src={URL.createObjectURL(file)} alt="" />
					</ImageListItem>
				))}
			</ImageList>
			<TextInput
				label="Report Description"
				defaultValue={props.report.description}
				multiline
				rows={4}
				readOnly
			/>
		</React.Fragment>
	)
}

const signInButtonStyle: SystemStyleObject<Theme> = { alignSelf: "flex-end" }

type Props = {
	report: IReport
}

type QueryParams = {
	"report-id": string
}

const reportService = createReportService(
	O.toUndefined(getConfig().reportCsvPath) ?? "report.csv",
)

export const getServerSideProps: GetServerSideProps<
	Props,
	QueryParams
> = async (context: GetServerSidePropsContext<QueryParams>) => {
	return pipe(
		Optional.fromPath<GetServerSidePropsContext<QueryParams>>()([
			"params",
			"report-id",
		]).getOption(context),
		TE.fromOption(() => new Error("report-id is not found")),
		TE.chainEitherKW(ReportIdCodec.decode),
		TE.chainW(reportService.getById),
		TE.match(
			(): GetServerSidePropsResult<Props> => ({ notFound: true }),
			(report): GetServerSidePropsResult<Props> => ({ props: { report } }),
		),
	)()
}
