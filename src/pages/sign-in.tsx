import { Button, Stack } from "@mui/material"
import { Theme } from "@mui/material/styles"
import { SystemStyleObject } from "@mui/system"
import { useRouter } from "next/router"
import React from "react"

import { PasswordInput } from "../component/password-input"
import { TextInput } from "../component/text-input"

export default function SignIn(): JSX.Element {
	const router = useRouter()

	const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault()

		const formData = new FormData(event.currentTarget)

		const username = formData.get(usernameInputName)
		const password = formData.get(passwordInputName)

		if (typeof username !== "string" || typeof password !== "string") {
			return console.error("Invalid form data", { username, password })
		}

		router.push("/")
	}

	return (
		<Stack component="form" onSubmit={onSubmit} spacing={2} sx={formStyle}>
			<h1>Sign In</h1>
			<TextInput
				label="Username"
				name={usernameInputName}
				autoComplete="username"
				required
			/>
			<PasswordInput
				label="Password"
				name={passwordInputName}
				autoComplete="current-password"
				required
			/>
			<Button type="submit" variant="contained">
				Sign In
			</Button>
		</Stack>
	)
}

function formStyle(theme: Theme): SystemStyleObject<Theme> {
	return {
		margin: "0 auto",
		padding: theme.spacing(2),
		maxWidth: theme.breakpoints.values.md,
	}
}

const usernameInputName = "username"
const passwordInputName = "password"
