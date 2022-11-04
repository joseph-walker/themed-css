import { ContractGrammar } from "./grammar";

const validKindsFixtures = [
	["FlexDirection"],
	["BorderColor"],
	["Background"]
];

const validIdentifierFixtures = [
	["foo"],
	["fooBar"],
	["FOO"]
];

const invalidIdentifierFixtures = [
	["foo_"],
];

const validUnitFixtures = [
	["foo:Color"],
	["foo: Color"],
	["foo :Color"],
	["foo : Padding"],
	["foo	:	Padding"],
];

const validGroupFixtures = [
	["foo { bar: Color }"],
	[`foo {
		bar: Color
	}`],
	[`FOO {
	 	bar { baz: Color}}`]
];

const validContractFixtures = [
	[`@contract example {
		foo: Padding
		bar {
			baz: Margin
		}
	}`],
	["@contract anchor { color: Color }"],
	[`
	Example of a doc comment in a CSS comment block.
	@contract anchor { color: Color }`],
	["See jwalker@rent.com for help with contract blocks @contract anchor { color: Color }"]
]

describe("Contract Grammar - Stress Test", function () {
	describe("Kinds", function () {
		describe.each(validKindsFixtures)("kind => \"%s\"", function (kind) {
			it("is parsed without an error", function () {
				expect(() => ContractGrammar.Kind.tryParse(kind)).not.toThrow();
			});
		});
	});

	describe("Identifiers", function () {
		describe.each(validIdentifierFixtures)("identifier => \"%s\"", function (identifier) {
			it("is parsed without an error", function () {
				expect(() => ContractGrammar.Identifier.tryParse(identifier)).not.toThrow();
			});
		});

		describe.each(invalidIdentifierFixtures)("identifier => \"%s\"", function (identifier) {
			it("does not parse and throws an error", function () {
				try {
					const result = ContractGrammar.Identifier.parse(identifier);
				} catch (e) {
					console.log(e);
				}
			});
		})
	});

	describe("Units", function () {
		describe.each(validUnitFixtures)("unit => \"%s\"", function (unit) {
			it("is parsed without an error", function () {
				expect(() => ContractGrammar.Unit.tryParse(unit)).not.toThrow();
			});
		});
	});

	describe("Groups", function () {
		describe.each(validGroupFixtures)("group => \"%s\"", function (group) {
			it("is parsed without an error", function () {
				expect(() => ContractGrammar.Group.tryParse(group)).not.toThrow();
			});
		});
	});

	describe("Contracts", function () {
		describe.each(validContractFixtures)("contract => \"%s\"", function (contract) {
			it("is parsed without an error", function () {
				expect(() => ContractGrammar.Contract.tryParse(contract)).not.toThrow();
			});
		});
	});
});
