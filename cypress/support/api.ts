// Authentication

import type { ILoginCredentials } from "../../src/common/api"
import { createCredentialsHeader } from "../../src/modules/auth/api"
import type { IAuth } from "../../src/modules/auth/type"

export function login(
	credentials: ILoginCredentials,
): Cypress.Chainable<IAuth> {
	return cy
		.request({
			method: "POST",
			url: "/api/sign-in",
			headers: createCredentialsHeader(credentials),
			log: false,
		})
		.its("body", { log: false })
		.then((response: IAuth): IAuth => {
			Cypress.log({ name: `Log in as "${credentials.username}"` })
			return response
		})
}
