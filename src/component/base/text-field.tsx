import { InputLabelProps } from "@mui/material/InputLabel"
import MuiTextField from "@mui/material/TextField"
import React from "react"

export type AutoComplete =
	| "current-password"
	| "email"
	| "new-password"
	| "off"
	| "on"
	| "username"

export interface Props {
	label?: React.ReactNode
	name?: string
	required?: boolean
	type?: React.HTMLInputTypeAttribute
	autoComplete?: AutoComplete
}

export function TextField(props: Props): JSX.Element {
	return <MuiTextField {...props} InputLabelProps={removeRequiredLabel} />
}

const removeRequiredLabel: InputLabelProps = { required: false }
