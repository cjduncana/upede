describe("Sign In", () => {
	beforeEach(() => {
		cy.visit("/")
	})

	it("should sign in as an Admin", () => {
		cy.findByRole("link", { name: "Sign In" }).click()

		cy.findByLabelText("Username").type("admin")
		cy.findByLabelText("Password").type("admin")
		cy.findByRole("button", { name: "Sign In" }).click()

		cy.findByText("admin").should("exist")
	})
})

export {}
