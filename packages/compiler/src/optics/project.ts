import type { Mark } from 'parsimmon';

import type { Origin } from '../language/ast';
import type { Marked } from '../language/astMarked';

export type UnMark<T> = T extends Mark<infer U> ? U : T;

function unmark<T extends Mark<any>>(markedThing: T): UnMark<T> {
	return markedThing.value;
}

/**
 * Given a raw MarkedContract from the parser, project it into a naked
 * Contract object with syntax and line/column information removed. Utility method
 * for simpler consumption of the AST.
 *
 * @param marked
 * @returns
 */
export const projectToUnmarked: (i: Marked.Statement) => Origin.Statement = function (
	marked
) {
	const unmarked = unmark<Marked.Statement>(marked);

	switch (unmarked.type) {
		case 'Group': {
			return {
				...unmarked,
				identifier: unmark(unmarked.identifier),
				statements: unmarked.statements.map(projectToUnmarked),
			};
		}
		case 'Unit': {
			return {
				...unmarked,
				identifier: unmark(unmarked.identifier),
				kind: unmark(unmarked.kind),
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
