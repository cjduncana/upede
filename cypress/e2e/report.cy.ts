describe("Report", () => {

	beforeEach(() => {
		cy.visit("/")
	})

	it("should create a Report", () => {
		cy.fixture("broken-street.jpeg").as("brokenStreet")
		cy.fixture("grassy-street.jpeg").as("grassyStreet")
		cy.fixture("pothole.jpeg").as("pothole")
		cy.findByLabelText("Select Images").selectFile(["@brokenStreet", "@grassyStreet", "@pothole"], { force: true })

		cy.findByRole("textbox", { name: "Image Description" }).type("There's a pothole!")

		cy.findByRole("button", { name: "Generate Report" }).click()

		cy.findByText("Report was generated.").should("exist")
	})
})
