import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import {
	Alert,
	Button,
	ImageList,
	ImageListItem,
	Stack,
	TextField,
	useMediaQuery,
} from "@mui/material"
import { Theme, useTheme } from "@mui/material/styles"
import { SystemStyleObject } from "@mui/system"
import { either as E, option as O } from "fp-ts"
import type { Option } from "fp-ts/Option"
import { NonEmptyString } from "io-ts-types"
import Link from "next/link"
import React from "react"

import { useAuth } from "../context/auth"
import type { IAuth } from "../modules/auth/type"
import { createReport } from "../modules/report/api"
import type { IReport } from "../modules/report/type"

export default function Index(): JSX.Element {
	const [auth, isAuthLoaded] = useAuth()
	const theme = useTheme()
	const matchDownMd = useMediaQuery(theme.breakpoints.down("sm"))

	const [fileList, setFileList] = React.useState<File[]>([])
	const [isImagesInvalid, setIsImagesInvalid] = React.useState(false)
	const [newReport, setNewReport] = React.useState<IReport>()

	const onImagesChange: React.ChangeEventHandler<HTMLInputElement> = (
		event,
	) => {
		event.preventDefault()

		setFileList(event.target.files ? Array.from(event.target.files) : [])
		setIsImagesInvalid(false)
	}

	const onImagesInvalid: React.FormEventHandler<HTMLInputElement> = (event) => {
		event.preventDefault()

		setIsImagesInvalid(event.currentTarget.validity.valueMissing)
	}

	// TODO: Turn into a pipe
	const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault()

		const formData = new FormData(event.currentTarget)

		const descriptionResult = NonEmptyString.decode(
			formData.get(descriptionInputName),
		)

		if (E.isLeft(descriptionResult)) {
			return console.error("Invalid form data", descriptionResult)
		}

		const result = await createReport({
			description: descriptionResult.right,
		})()

		if (E.isLeft(result)) {
			return console.error("Failed to create report", result)
		}

		setNewReport(result.right)
	}

	if (!isAuthLoaded) return <React.Fragment />

	return (
		<React.Fragment>
			{newReport && (
				<Alert
					severity="success"
					action={<ViewReportButton report={newReport} auth={auth} />}
				>
					Report was generated.
				</Alert>
			)}
			<Stack component="form" onSubmit={onSubmit} spacing={2}>
				<Button
					variant="contained"
					size="small"
					endIcon={<AccountCircleIcon />}
					sx={signInButtonStyle}
					LinkComponent={Link}
					href={O.isSome(auth) ? undefined : "/sign-in"}
				>
					{O.isSome(auth) ? auth.value.username : "Sign In"}
				</Button>
				<Button component="label" color={isImagesInvalid ? "error" : undefined}>
					Select Images
					<input
						hidden
						type="file"
						accept="image/*"
						capture
						multiple
						required
						onChange={onImagesChange}
						onInvalid={onImagesInvalid}
					/>
				</Button>
				<ImageList cols={matchDownMd ? 1 : 2}>
					{fileList.map((file, index) => (
						<ImageListItem key={index}>
							{/* eslint-disable-next-line @next/next/no-img-element*/}
							<img src={URL.createObjectURL(file)} alt="" />
						</ImageListItem>
					))}
				</ImageList>
				<TextField
					label="Report Description"
					name={descriptionInputName}
					multiline
					rows={4}
					required
				/>
				<Button type="submit" variant="contained">
					Generate Report
				</Button>
			</Stack>
		</React.Fragment>
	)
}

const signInButtonStyle: SystemStyleObject<Theme> = { alignSelf: "flex-end" }

type IViewReportButtonProps = {
	report: IReport
	auth: Option<IAuth>
}

function ViewReportButton(props: IViewReportButtonProps): JSX.Element {
	return O.isSome(props.auth) ? (
		<Button
			color="inherit"
			size="small"
			LinkComponent={Link}
			href={`/report/${props.report.id}`}
		>
			View Report
		</Button>
	) : (
		<React.Fragment />
	)
}

const descriptionInputName = "description"
