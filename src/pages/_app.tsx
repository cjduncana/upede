import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"

import CssBaseline from "@mui/material/CssBaseline"
import type { AppProps } from "next/app"
import React from "react"

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
	return (
		<React.Fragment>
			<CssBaseline />
			<Component {...pageProps} />
		</React.Fragment>
	)
}
