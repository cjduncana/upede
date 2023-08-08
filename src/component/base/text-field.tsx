import type { InputBaseProps } from "@mui/material/InputBase"
import type { InputLabelProps } from "@mui/material/InputLabel"
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
	defaultValue?: string
	name?: string
	required?: boolean
	type?: React.HTMLInputTypeAttribute
	autoComplete?: AutoComplete
	readOnly?: boolean
	multiline?: boolean
	rows?: number
}

export function TextField(props: Props): JSX.Element {
	return (
		<MuiTextField
			{...props}
			InputProps={props.readOnly ? readOnlyInputProps : undefined}
			InputLabelProps={removeRequiredLabel}
		/>
	)
}

const readOnlyInputProps: InputBaseProps = { readOnly: true }

const removeRequiredLabel: InputLabelProps = { required: false }
