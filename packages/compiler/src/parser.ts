import * as P from "parsimmon";

type Node<T extends string> =
	{ type: T
	}

export type MarkedUnitType = P.Mark<UnitType>
export type UnitType
	= "Dimension"
	| "Color"
	| "FlexAlignment"
	| "Number"
	| "Unknown"

export type ContractUnit = P.Mark<__ContractUnit>
type __ContractUnit = Node<"ContractUnit"> &
	{ unitName: string
	, unitType: MarkedUnitType
	}

export type ContractGroup = P.Mark<__ContractGroup>
type __ContractGroup = Node<"ContractGroup"> &
	{ identifier: string
	, statements: ContractStatement[]
	}

export type ContractStatement
	= ContractUnit
	| ContractGroup

export type Contract = P.Mark<__Contract>
type __Contract = Node<"Contract"> &
	{ contractName: string
	, statements: ContractStatement[]
	}

const ContractLanguage = P.createLanguage({
	Dimension: () => P.string("dimension").map(_ => "Dimension").mark(),
	Color: () => P.string("color").map(_ => "Color").mark(),
	FlexAlignment: () => P.string("flex-alignment").map(_ => "FlexAlignment").mark(),
	Number: () => P.string("number").map(_ => "Number").mark(),
	Type: function (lang) {
		return P.alt(
			lang.Dimension,
			lang.Number,
			lang.Color,
			lang.FlexAlignment
		);
	},
	ContractToken: function () {
		return P.string("@contract");
	},
	ContractOpener: function (lang) {
		return lang.ContractToken.trim(lang._)
			.then(lang.Identifier.trim(lang._));
	},
	Identifier: function () {
		return P.regex(/[a-z\-]+/);
	},
	ContractUnit: function (lang) {
		return P
		.seq(
			lang.Identifier.skip(P.string(":").trim(lang._)),
			lang.Type
		).map(function ([unitName, unitType]) {
			return {
				type: "ContractUnit",
				unitName,
				unitType
			};
		})
		.mark()
	},
	ContractGroup: function (lang) {
		return P.seq(
			lang.Identifier.skip(lang._),
			lang.Map
		).map(function ([identifier, statements]) {
			return {
				type: "ContractGroup",
				identifier,
				statements
			};
		})
		.mark();
	},
	ContractStatement: function (lang) {
		return P.alt(
			lang.ContractGroup,
			lang.ContractUnit
		);
	},
	Map: function (lang) {
		const opener = P.string("{").trim(lang._);
		const closer = P.string("}").trim(lang._);

		return opener
			.then(lang.ContractStatement.sepBy1(lang._).trim(lang._))
			.skip(closer);
	},
	_: function () {
		return P.optWhitespace;
	},
	Contract: function (lang) {
		return P.regex(/!?/)
			.then(P.seq(
				lang.ContractOpener,
				lang.Map
			))
			.map(function ([contractName, statements]) {
				return {
					type: "Contract",
					contractName,
					statements
				};
			})
			.mark()
	}
});

export function parse(input: string): Contract {
	return ContractLanguage.Contract.tryParse(input);
}

function fold_(prefix: string, statements: ContractStatement[]): [string, UnitType][] {
	let vars: [string, UnitType][] = [];

	for (const entry of statements) {
		if (entry.value.type === "ContractUnit") {
			vars.push([`${prefix}-${entry.value.unitName}`, entry.value.unitType.value])
		} else {
			vars = vars.concat(fold_(`${prefix}-${entry.value.identifier}`, entry.value.statements))
		}
	}

	return vars;
}

export function fold(contract: Contract): [string, UnitType][] {
	return fold_(`--${contract.value.contractName}`, contract.value.statements);
}
