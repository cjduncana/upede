import type { IOEither } from "fp-ts/IOEither"
import type { Option } from "fp-ts/Option"
import * as t from "io-ts"

import { IAuth } from "./type"
import { getItem, setItem } from "../../common/local-storage"
import type { IGetItemError, ISetItemError } from "../../common/local-storage"

const LocalStorageKey = {
	Auth: "__UPEDE__/AUTH",
}

export function getAuth(
	window: Window,
): IOEither<IGetItemError, Option<IAuth>> {
	return getItem(
		window,
		LocalStorageKey.Auth,
		t.type({ username: t.string, jwtToken: t.string }).decode,
	)
}

export function setAuth(
	window: Window,
	auth: IAuth,
): IOEither<ISetItemError, void> {
	return setItem(window, LocalStorageKey.Auth, auth)
}
