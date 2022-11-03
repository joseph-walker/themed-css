import type { Mark } from 'parsimmon';

import type * as Origin from '../../language/ast';
import type * as Marked from '../../language/astMarked';

export type UnMark<T> = T extends Mark<infer U> ? U : T;

function projectMarkedToValue<T extends Mark<any>>(markedThing: T): UnMark<T> {
	return markedThing.value;
}

const projectStatementToAST: (i: Marked.Statement) => Origin.Statement = function (
	marked
) {
	const unmarked = projectMarkedToValue<Marked.Statement>(marked);

	switch (unmarked.type) {
		case 'Group': {
			return {
				...unmarked,
				identifier: projectMarkedToValue(unmarked.identifier),
				statements: unmarked.statements.map(projectStatementToAST),
			};
		}
		case 'Unit': {
			return {
				...unmarked,
				identifier: projectMarkedToValue(unmarked.identifier),
				kind: projectMarkedToValue(unmarked.kind),
			};
		}
		default: {
			const unknownStatement: never = unmarked;
			throw new Error(
				`Encountered unexpected statement ${unknownStatement}`
			);
		}
	}
};

/**
 * Given a raw MarkedContract from the parser, project it into a naked
 * Contract object with syntax and line/column information removed. Utility method
 * for simpler consumption of the AST.
 *
 * @param marked
 * @returns
 */
export const projectToAST: (i: Marked.Contract) => Origin.Contract = function (
	marked
) {
	const unmarked = projectMarkedToValue(marked);

	return {
		...unmarked,
		identifier: projectMarkedToValue(unmarked.identifier),
		statements: unmarked.statements.map(projectStatementToAST),
	};
};
