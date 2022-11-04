import {
	createLanguage,
	string,
	alt,
	regex,
	seq,
	optWhitespace,
	whitespace,
} from 'parsimmon';
import { Ord } from 'fp-ts/number';
import { reverse, contramap } from 'fp-ts/Ord';
import { sortBy } from 'fp-ts/Array';

import { Marked } from './astMarked';
import { kinds } from './kinds';

type Language = {
	Kind: Marked.Kind;
	Identifier: Marked.Identifier;
	Unit: Marked.Unit;
	Group: Marked.Group;
	Map: Marked.Statement[];
	Statement: Marked.Statement;
	Contract: Marked.Contract;
};

export const ContractGrammar = createLanguage<Language>({
	Kind: function (lang) {
		// TODO - This is extraordinarily slow; optimize the parsing of Kinds.
		const kindsLongestToShortest = sortBy([
			reverse(contramap((s: string) => s.length)(Ord)),
		])(kinds);

		return alt(...kindsLongestToShortest.map((s) => string(s).mark()));
	},

	Identifier: function () {
		return regex(/[a-z]+/i)
			.mark()
			.desc('Invalid Identifier: Only alpha characters are allowed.');
	},

	Unit: function (lang) {
		const colonWithWhitespace = string(':').trim(optWhitespace);

		return seq(lang.Identifier.skip(colonWithWhitespace), lang.Kind)
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
		return lang.Identifier.skip(optWhitespace)
			.chain(function (identifier) {
				const opener = string('{').trim(optWhitespace);
				const closer = string('}').trim(optWhitespace);
				const statements = lang.Statement.sepBy1(whitespace);
				const body = opener
					.then(statements.trim(optWhitespace))
					.skip(closer);

				return body.map(function (statements) {
					return {
						type: 'Group' as const,
						identifier,
						statements,
					};
				});
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
			.desc('Missing contract Identifier');

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
