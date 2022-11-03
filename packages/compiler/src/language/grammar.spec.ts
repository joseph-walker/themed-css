import { ContractGrammar } from "./grammar";

const validIdentifierFixtures = [
	["foo"],
	["fooBar"],
	["FOO"]
];

const invalidIdentifierFixtures = [
	["foo_"],
];

const validUnitFixtures = [
	["foo:color"],
	["foo: color"],
	["foo :color"],
	["foo : number"],
	["foo	:	number"],
];

const validGroupFixtures = [
	["foo { bar: color }"],
	[`foo {
		bar: color
	}`],
	[`FOO {
	 	bar { baz: color}}`]
];

const validContractFixtures = [
	[`@contract example {
		foo: number
		bar {
			baz: color
		}
	}`],
	["@contract anchor { color: color }"],
	[`
	Example of a doc comment in a CSS comment block.
	@contract anchor { color: color }`],
	["See jwalker@rent.com for help with contract blocks @contract anchor { color: color }"]
]

describe("Contract Grammar - Stress Test", function () {
	describe("Identifiers", function () {
		describe.each(validIdentifierFixtures)("identifier => \"%s\"", function (identifier) {
			it("is parsed without an error", function () {
				expect(() => ContractGrammar.Identifier.tryParse(identifier)).not.toThrow();
			});
		});

		describe.each(invalidIdentifierFixtures)("identifier => \"%s\"", function (identifier) {
			it.only("does not parse and throws an error", function () {
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
