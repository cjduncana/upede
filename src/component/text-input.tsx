import React from "react"

import { TextField, Props as TextFieldProps } from "./base/text-field"

export type Props = Omit<TextFieldProps, "type">

export function TextInput(props: Props): JSX.Element {
	return <TextField {...props} type="text"  />
}
