import React from "react"

import { TextField, Props as TextFieldProps } from "./base/text-field"

export type Props = Omit<TextFieldProps, "type">

export function PasswordInput(props: Props): JSX.Element {
	return <TextField {...props} type="password" />
}
