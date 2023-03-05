import React from "react"

export default function Index(): JSX.Element {

	const [hasSubmitted, setHasSubmitted] = React.useState(false)

	const onSubmit: React.FormEventHandler = (event) => {
		event.preventDefault()

		setHasSubmitted(true)
	}

	return (
		<React.Fragment>
			<form onSubmit={onSubmit}>
				<div>
					<label htmlFor={imagesId}>Select Image</label>
					<input
						id={imagesId}
						type="file"
						accept="image/*"
						capture
						multiple
					/>
				</div>
				<div>
					<label htmlFor={descriptionId}>Image Description</label>
					<input id={descriptionId} />
				</div>
				<button type="submit">Generate Report</button>
			</form>
			{hasSubmitted && (
				<span>Report was generated.</span>
			)}
		</React.Fragment>
	)
}

const imagesId = "images"
const descriptionId = "description"
