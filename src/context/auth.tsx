import { either as E, option as O } from "fp-ts"
import type { Option } from "fp-ts/Option"
import React from "react"

import {
	getAuth as getAuthFromLocalStorage,
	setAuth as setAuthToLocalStorage,
} from "../modules/auth/local-storage"
import type { IAuth } from "../modules/auth/type"

const AuthContext = React.createContext<
	| [
			Option<IAuth>,
			boolean,
			React.Dispatch<React.SetStateAction<Option<IAuth>>>,
	  ]
	| undefined
>(undefined)

export function AuthProvider(props: React.PropsWithChildren): JSX.Element {
	const [auth, setAuth] = React.useState<Option<IAuth>>(O.none)
	const [isAuthLoaded, setIsAuthLoaded] = React.useState(false)
	const typeofWindow = typeof window

	React.useEffect(() => {
		if (!window) return

		const result = getAuthFromLocalStorage(window)()

		if (E.isRight(result)) {
			setAuth(result.right)
		} else {
			console.error(result.left)
		}

		setIsAuthLoaded(true)
	}, [typeofWindow])

	return (
		<AuthContext.Provider value={[auth, isAuthLoaded, setAuth]}>
			{props.children}
		</AuthContext.Provider>
	)
}

export function useAuth(): [Option<IAuth>, boolean] {
	const context = React.useContext(AuthContext)

	if (!context) {
		throw new Error("useAuth must be used within a AuthProvider")
	}

	const [auth, isAuthLoaded] = context

	return [auth, isAuthLoaded]
}

export function useUpdateAuth(): (auth: IAuth) => void {
	const context = React.useContext(AuthContext)

	if (!context) {
		throw new Error("useUpdateAuth must be used within a AuthProvider")
	}

	const [, , setAuth] = context

	return (auth: IAuth) => {
		setAuth(O.some(auth))

		if (!window) {
			return
		}

		const result = setAuthToLocalStorage(window, auth)()

		if (E.isLeft(result)) {
			console.error(result.left)
		}
	}
}
