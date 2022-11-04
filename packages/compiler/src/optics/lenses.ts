import type { Mark } from 'parsimmon';

import type { Marked } from '../language/astMarked';
import type { Kind, Property } from '../language/kinds';

import { Traversable } from 'fp-ts/Array';
import { fromTraversable, Iso, Lens, Prism } from 'monocle-ts';

import { propertyToKind, kindToProperty } from '../language/kinds';

export const start = Lens.fromProp<Mark<any>>()('start');

export const end = Lens.fromProp<Mark<any>>()('end');

export const identifier = {
	value: Lens.fromProp<Marked.Identifier>()('value'),
} as const;

export const kind = {
	value: Lens.fromProp<Marked.Kind>()('value'),
	isoProperty: new Iso<Kind, Property>(
		kindToProperty,
		propertyToKind
	)
} as const;

export const unit = {
	identifier: Lens.fromPath<Marked.Unit>()(['value', 'identifier']),
	kind: Lens.fromPath<Marked.Unit>()(['value', 'kind']),
	variable: Lens.fromPath<Marked.Unit>()(['value', 'variable']),
	T: fromTraversable(Traversable)<Marked.Unit>(),
} as const;

const groupStatements = Lens.fromPath<Marked.Group>()(['value', 'statements']);

export const group = {
	identifier: Lens.fromPath<Marked.Group>()(['value', 'identifier']),
	statements: groupStatements,
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
	T: fromTraversable(Traversable)<Marked.Statement>(),
} as const;
