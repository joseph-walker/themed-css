import {
	createLanguage,
	string,
	alt,
	regex,
	seq,
	optWhitespace,
	whitespace,
} from 'parsimmon';

import * as Marked from './astMarked';
import { Kind } from './ast';

type Language = {
	Dimension: Kind.Dimension;
	Color: Kind.Color;
	FlexAlignment: Kind.FlexAlignment;
	Number: Kind.Number;
	Type: Marked.Kind;
	Identifier: Marked.Identifier;
	Unit: Marked.Unit;
	Group: Marked.Group;
	Map: Marked.Statement[];
	Statement: Marked.Statement;
	Contract: Marked.Contract;
};

export const ContractGrammar = createLanguage<Language>({
	Dimension: () => string('dimension').map((_) => Kind.Dimension as const),

	Color: () => string('color').map((_) => Kind.Color as const),

	FlexAlignment: () =>
		string('flex-alignment').map((_) => Kind.FlexAlignment as const),

	Number: () => string('number').map((_) => Kind.Number as const),

	Type: function (lang) {
		return alt(
			lang.Dimension,
			lang.Number,
			lang.Color,
			lang.FlexAlignment
		).mark();
	},

	Identifier: function () {
		return regex(/[a-z]+/i)
			.mark()
			.desc("Invalid Identifier: Only alpha characters are allowed.");
	},

	Unit: function (lang) {
		const colonWithWhitespace = string(':').trim(optWhitespace);

		return seq(lang.Identifier.skip(colonWithWhitespace), lang.Type)
			.map(function ([identifier, kind]) {
				return {
					type: 'Unit' as const,
					identifier,
					kind,
				};
			})
			.mark();
	},

	Map: function (lang) {
		const opener = string('{').trim(optWhitespace);
		const closer = string('}').trim(optWhitespace);

		const statements = lang.Statement.sepBy1(whitespace);

		return opener.then(statements.trim(optWhitespace)).skip(closer);
	},

	Group: function (lang) {
		return seq(lang.Identifier.skip(optWhitespace), lang.Map)
			.map(function ([identifier, statements]) {
				return {
					type: 'Group' as const,
					identifier,
					statements,
				};
			})
			.mark();
	},

	Statement: function (lang) {
		return alt(lang.Group, lang.Unit);
	},

	Contract: function (lang) {
		const anyRandomGarbage = regex(/(?:.|\n)*?(?=@contract)/);
		const contractOpener = string('@contract')
			.skip(whitespace)
			.then(lang.Identifier)
			.desc("Missing contract Identifier");

		return anyRandomGarbage
			.then(seq(contractOpener, lang.Map))
			.map(function ([identifier, statements]) {
				return {
					type: 'Contract' as const,
					identifier,
					statements,
				};
			})
			.mark();
	},
});
