import { some } from "fp-ts/Option";

import { validateProperty } from "./property";

describe("Property validation", function () {
	it("returns ok if everything is ok", function () {
		const result = validateProperty("border", some("1px solid red"));
		expect(result.result.type).toBe("Ok");
	});

	it("raises errors if properties are invalid", function () {
		const result = validateProperty("border", some("1px solid flex"));
		expect(result.result.type).toBe("Error");
	});
});
