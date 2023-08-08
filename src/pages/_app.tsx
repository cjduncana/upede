import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"

import CssBaseline from "@mui/material/CssBaseline"
import type { AppProps } from "next/app"
import Head from "next/head"
import React from "react"

import { Container } from "../component/container"
import { AuthProvider } from "../context/auth"

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
	return (
		<AuthProvider>
			<CssBaseline />
			<Head>
				<meta name="viewport" content="initial-scale=1, width=device-width" />
			</Head>
			<Container>
				<Component {...pageProps} />
			</Container>
		</AuthProvider>
	)
}
