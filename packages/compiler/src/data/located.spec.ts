import { flow } from "fp-ts/function";

import { map, locate } from "./located";

describe("Located Type", function () {
	describe("obeys functor laws", function () {
		it("preserves identity", function () {
			const id = <T>(t: T) => t;

			const locationFixture = "inside the located.spec.ts file";
			const valueFixture = "a value";

			const located = locate(locationFixture, valueFixture);

			expect(
				map(id)(located)
			).toEqual(
				id(located)
			);
		});

		it("preserves composition", function () {
			const addTwo = (n: number) => n + 2;
			const addTen = (n: number) => n + 10;

			const locationFixture = "inside the located.spec.ts file";
			const valueFixture = 5;

			const located = locate(locationFixture, valueFixture);

			expect(
				map(
					flow(addTwo, addTen)
				)(located)
			).toEqual(
				flow(
					map(addTwo),
					map(addTen)
				)(located)
			);
		});
	});
});
