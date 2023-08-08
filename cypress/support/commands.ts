import "@testing-library/cypress/add-commands"

import * as API from "./api"
import type { ILoginCredentials } from "../../src/common/api"

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Login as a Local user to the system
			 */
			login(input?: Partial<ILoginCredentials>): Chainable<null>
		}
	}
}

Cypress.Commands.add("login", (input): Cypress.Chainable<null> => {
	const credentials: ILoginCredentials = {
		username: input?.username ?? Cypress.env("username"),
		password: input?.password ?? Cypress.env("password"),
	}

	return API.login(credentials)
		.then((auth) => {
			window.localStorage.setItem("__UPEDE__/AUTH", JSON.stringify(auth))
		})
		.end()
})
