import { Stack } from "@mui/material"
import { Theme } from "@mui/material/styles"
import { SystemStyleObject } from "@mui/system"
import React from "react"

export function Container(props: React.PropsWithChildren): JSX.Element {
	return (
		<Stack spacing={2} sx={containerStyle}>
			{props.children}
		</Stack>
	)
}

function containerStyle(theme: Theme): SystemStyleObject<Theme> {
	return {
		margin: "0 auto",
		padding: theme.spacing(2),
		maxWidth: theme.breakpoints.values.md,
	}
}
