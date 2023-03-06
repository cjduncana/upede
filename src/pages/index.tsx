import { Alert, Button, ImageList, ImageListItem, Stack, TextField, useMediaQuery } from "@mui/material"
import { Theme, useTheme } from "@mui/material/styles"
import { SystemStyleObject } from "@mui/system"
import React from "react"

export default function Index(): JSX.Element {

	const theme = useTheme()
	const matchDownMd = useMediaQuery(theme.breakpoints.down("sm"))

	const [fileList, setFileList] = React.useState<File[]>([])
	const [hasSubmitted, setHasSubmitted] = React.useState(false)
	const [isImagesInvalid, setIsImagesInvalid] = React.useState(false)

	const onImagesChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
		event.preventDefault()

		setFileList(event.target.files ? Array.from(event.target.files) : [])
		setIsImagesInvalid(false)
	}

	const onImagesInvalid: React.FormEventHandler<HTMLInputElement> = (event) => {
		event.preventDefault()

		setIsImagesInvalid(event.currentTarget.validity.valueMissing)
	}

	const onSubmit: React.FormEventHandler = (event) => {
		event.preventDefault()

		setHasSubmitted(true)
	}

	return (
		<React.Fragment>
			{hasSubmitted && (
				<Alert severity="success">Report was generated.</Alert>
			)}
			<Stack
				component="form"
				onSubmit={onSubmit}
				spacing={2}
				sx={formStyle}
			>
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
				<ImageList cols={matchDownMd ? 1 : 2 }>
					{fileList.map((file) => (
						<ImageListItem key={file.name}>
							{/* eslint-disable-next-line @next/next/no-img-element*/}
							<img src={URL.createObjectURL(file)} alt="" />
						</ImageListItem>
					))}
				</ImageList>
				<TextField label="Image Description" multiline rows={4} required />
				<Button type="submit" variant="contained">Generate Report</Button>
			</Stack>
		</React.Fragment>
	)
}

function formStyle(theme: Theme): SystemStyleObject<Theme> {
	return {
		margin: "0 auto",
		padding: theme.spacing(2),
		maxWidth: theme.breakpoints.values.md,
	}
}
