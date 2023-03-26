import { either as E } from "fp-ts"
import * as fs from "fs/promises"
import mock from "mock-fs"

import { Row, appendRow } from "./csvDocument"

describe("CSV Document", () => {

	describe("#appendRow", () => {

		afterEach(mock.restore)

		it("should create a CSV document if none", async () => {

			const path = "test.csv"
			const encode = (value: number): Row => ({ value: value.toString(), isPositive: (value > 0).toString() })

			mock()

			const appendResult = await appendRow(1)({ path, encode })()

			expect(E.isRight(appendResult)).toBeTruthy()

			const content = await fs.readFile(path, "utf8")

			expect(content).toBe("value,isPositive\n1,true")
		})

		it("should create a CSV document if none", async () => {

			const path = "test.csv"
			const encode = (value: number): Row => ({ value: value.toString(), isPositive: (value > 0).toString() })

			mock({ [path]: "value,isPositive\n1,true" })

			const appendResult = await appendRow(-1)({ path, encode })()

			expect(E.isRight(appendResult)).toBeTruthy()

			const content = await fs.readFile(path, "utf8")

			expect(content).toBe("value,isPositive\n1,true\n-1,false")
		})
	})
})
