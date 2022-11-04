import {
	string,
	alt,
	regex,
	seq,
	optWhitespace,
	whitespace,
	Parser,
} from 'parsimmon';
import { Ord } from 'fp-ts/number';
import { reverse, contramap } from 'fp-ts/Ord';
import { sortBy } from 'fp-ts/Array';

import { Marked } from './astMarked';
import { kinds } from './kinds';

export const Kind: Parser<Marked.Kind> = function () {
	// TODO - This is extraordinarily slow; optimize the parsing of Kinds.
	const kindsLongestToShortest = sortBy([
		reverse(contramap((s: string) => s.length)(Ord)),
	])(kinds);

	return alt(...kindsLongestToShortest.map((s) => string(s).mark()));
}();

export const Identifier: Parser<Marked.Identifier> = function () {
	return regex(/[a-z]+/i)
		.mark()
		.desc('Invalid Identifier: Only alpha characters are allowed.');
}();

export const Unit: Parser<Marked.Unit> = function () {
	const colonWithWhitespace = string(':').trim(optWhitespace);

	return seq(Identifier.skip(colonWithWhitespace), Kind)
		.map(function ([identifier, kind]) {
			return {
				type: 'Unit' as const,
				identifier,
				kind,
			};
		})
		.mark();
}();

export const Group: Parser<Marked.Group> = function () {
	return Identifier.skip(optWhitespace)
		.chain(function (identifier) {
			const opener = string('{').trim(optWhitespace);
			const closer = string('}').trim(optWhitespace);
			const statements = Statement(identifier.value).sepBy1(whitespace);
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
}();

export const Statement = function (parent: string): Parser<Marked.Statement> {
	console.log(parent);
	return alt(Group, Unit);
};

// const Contract: Parser<Marked.Contract> = function (lang) {
// 	const anyRandomGarbage = regex(/(?:.|\n)*?(?=@contract)/);
// 	const contractOpener = string('@contract')
// 		.skip(whitespace)
// 		.then(Identifier)
// 		.desc('Missing contract Identifier');

// 	return anyRandomGarbage
// 		.then(seq(contractOpener, Map))
// 		.map(function ([identifier, statements]) {
// 			return {
// 				type: 'Contract' as const,
// 				identifier,
// 				statements,
// 			};
// 		})
// 		.mark();
// }();
