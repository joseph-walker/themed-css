import type { Mark } from 'parsimmon';

import * as Marked from '../language/astMarked';

import { Traversable } from 'fp-ts/Array';
import { fromTraversable, Lens, Prism } from 'monocle-ts';

export const start = Lens.fromProp<Mark<any>>()('start');
export const end = Lens.fromProp<Mark<any>>()('end');

export const identifier = {
	value: Lens.fromProp<Marked.Identifier>()('value'),
} as const;

export const kind = {
	value: Lens.fromProp<Marked.Kind>()('value'),
} as const;

export const unit = {
	identifier: Lens.fromPath<Marked.Unit>()(['value', 'identifier']),
	kind: Lens.fromPath<Marked.Unit>()(['value', 'kind']),
} as const;

const groupStatements = Lens.fromPath<Marked.Group>()(['value', 'statements']);
export const group = {
	identifier: Lens.fromPath<Marked.Group>()(['value', 'identifier']),
	statements: groupStatements,
	statementsT: groupStatements.composeTraversal(fromTraversable(Traversable)<Marked.Statement>())
} as const;

export const statement = {
	unit: Prism.fromPredicate<Marked.Statement, Marked.Unit>(function (
		statement
	): statement is Marked.Unit {
		return statement.value.type === 'Unit';
	}),
	group: Prism.fromPredicate<Marked.Statement, Marked.Group>(function (
		statement
	): statement is Marked.Group {
		return statement.value.type === 'Group';
	}),
} as const;

const contractStatements = Lens.fromPath<Marked.Contract>()(['value', 'statements']);
export const contract = {
	identifier: Lens.fromPath<Marked.Contract>()(['value', 'identifier']),
	statements: contractStatements,
	statementsT: contractStatements.composeTraversal(fromTraversable(Traversable)<Marked.Statement>()),
} as const;