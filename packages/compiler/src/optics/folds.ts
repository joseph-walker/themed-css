import { flow } from 'fp-ts/lib/function';
import { foldMap } from 'fp-ts/lib/Tree';
import { getMonoid } from "fp-ts/Array"

import { type Shrub, projectToTree } from './project/tree';
import { Origin } from '../language/ast';

export type Variable = {
	name: string;
	kind: Origin.Kind;
}

/**
 * Given a Contract from the Parser, extract all the variables and their types
 * and return them as a list of Variables.
 */
export const foldVariables = flow(
	projectToTree,
	foldMap(getMonoid<Variable>())((s: Shrub) => s.kind === "void" ? [] : [{ name: s.identifier, kind: s.kind }])
);
