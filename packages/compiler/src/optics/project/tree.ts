import type { Origin } from '../../language/ast';
import type { Marked } from '../../language/astMarked';

import { make, Tree } from 'fp-ts/Tree';

import { projectToAST } from './ast';

export type Shrub = {
	identifier: string;
	kind: Origin.Kind | 'void';
};

const projectToForest = (prefix: string) => (statement: Origin.Statement): Tree<Shrub> => {
	if (statement.type === 'Unit') {
		return make(
			{ identifier: `${prefix}-${statement.identifier}`, kind: statement.kind },
			[]
		);
	} else {
		return make(
			{ identifier: "", kind: 'void' },
			statement.statements.map(projectToForest(`${prefix}-${statement.identifier}`))
		);
	}
}

/**
 * Given a raw MarkedContract from the parser, project it into an FP-TS
 * Tree (rose tree) to allow for folding and recursive through native FP-TS functions.
 *
 * @param marked
 * @returns
 */
export const projectToTree: (i: Marked.Contract) => Tree<Shrub> = function (
	marked
) {
	const ast = projectToAST(marked);
	return make(
		{ identifier: "", kind: 'void' },
		ast.statements.map(projectToForest(`--${ast.identifier}`))
	);
};
