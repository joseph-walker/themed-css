import { readFile } from "fs/promises";
import { resolve } from "path";

import { extractContractsFromCss, extractVariablesFromCss } from "./extract";

function loadFixture(name: string) {
	return readFile(resolve(__dirname, `__fixtures/${name}.css`), { encoding: "utf-8" });
}

describe("CSS Extraction", function () {
	describe("contract extractor", function () {
		it("extracts a contract from CSS", async function () {
			const cssSrc = await loadFixture("contract");

			expect(() => extractContractsFromCss(cssSrc)).not.toThrow();

			const result = extractContractsFromCss(cssSrc);

			expect(result.length).toBe(1);
		});

		it("extracts all contracts from CSS with multiple contracts", async function () {
			const cssSrc = await loadFixture("multipleContracts");

			expect(() => extractContractsFromCss(cssSrc)).not.toThrow();

			const result = extractContractsFromCss(cssSrc);

			expect(result.length).toBe(2);
		});
	});

	describe("variable extractor", function () {
		it("extracts a list of fariables from CSS", async function () {
			const cssSrc = await loadFixture("theme");

			expect(() => extractVariablesFromCss(cssSrc)).not.toThrow();

			const result = extractVariablesFromCss(cssSrc);

			expect(result.length).toBe(2);
		});
	});
});
