import { either as E } from "fp-ts"
import * as fs from "fs/promises"
import type { NonEmptyString } from "io-ts-types"
import mock from "mock-fs"

import { createReportRepository } from "./csvRepository"

describe("CSV Report Repository", () => {
	describe("#create", () => {
		afterEach(mock.restore)

		it("should create a Report and add it to the CSV document", async () => {
			const path = "test.csv"
			const description = "test" as NonEmptyString
			const reportRepository = createReportRepository(path)

			mock()

			const createResult = await reportRepository.create({ description })()

			if (E.isLeft(createResult)) {
				throw new Error(createResult.left)
			}

			expect(createResult.right).toMatchObject({
				id: expect.any(String),
				description: "test",
			})

			const content = await fs.readFile(path, "utf8")

			expect(content).toBe(`id,description\n${createResult.right.id},test`)
		})
	})
})
