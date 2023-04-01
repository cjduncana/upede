import React from "react"

import { IAuth } from "../modules/auth/type"

const AuthContext = React.createContext<
	| [IAuth | undefined, React.Dispatch<React.SetStateAction<IAuth | undefined>>]
	| undefined
>(undefined)

export function AuthProvider(props: React.PropsWithChildren): JSX.Element {
	const [auth, setAuth] = React.useState<IAuth>()

	return (
		<AuthContext.Provider value={[auth, setAuth]}>
			{props.children}
		</AuthContext.Provider>
	)
}

export function useAuth(): IAuth | undefined {
	const context = React.useContext(AuthContext)

	if (!context) {
		throw new Error("useAuth must be used within a AuthProvider")
	}

	const [auth] = context

	return auth
}

export function useUpdateAuth(): (auth: IAuth) => void {
	const context = React.useContext(AuthContext)

	if (!context) {
		throw new Error("useUpdateAuth must be used within a AuthProvider")
	}

	const [, setAuth] = context

	return setAuth
}
