describe("Report", () => {

	beforeEach(() => {
		cy.visit("/")
	})

	it("should create a Report", () => {
		cy.fixture("pothole.jpeg").as("pothole")
		cy.findByLabelText("Select Image").selectFile("@pothole")

		cy.findByRole("textbox", { name: "Image Description" }).type("There's a pothole!")

		cy.findByRole("button", { name: "Generate Report" }).click()

		cy.findByText("Report was generated.").should("exist")
	})
})

export {}
