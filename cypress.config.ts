import { defineConfig } from "cypress"

export default defineConfig({
	e2e: {},
	env: {
		username: "admin",
		password: "admin",
	},
})
