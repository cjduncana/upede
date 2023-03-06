import { Alert, Button, Stack, TextField } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import React from "react"

export default function Index(): JSX.Element {

	const theme = useTheme()

	const [hasSubmitted, setHasSubmitted] = React.useState(false)

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
				sx={{ margin: "0 auto", padding: theme.spacing(2), maxWidth: 1024 }}
			>
				<Button component="label">
					Select Image
					<input
						hidden
						type="file"
						accept="image/*"
						capture
						multiple
					/>
				</Button>
				<TextField label="Image Description" multiline rows={4} />
				<Button type="submit" variant="contained">Generate Report</Button>
			</Stack>
		</React.Fragment>
	)
}
