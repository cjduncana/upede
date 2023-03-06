import { Html, Head, Main, NextScript } from "next/document"
import React from "react"

export default function Document(): JSX.Element {
	return (
		<Html>
			<Head>
				<meta name="viewport" content="initial-scale=1, width=device-width" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}
