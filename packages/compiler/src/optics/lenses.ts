import type { CssLocation } from 'css-tree';
import type { Mark, Index } from 'parsimmon';

import type { Marked } from '../language/astMarked';
import type { Kind, Property } from '../language/kinds';
import type { ValidationLocation } from '../data/validation';

import { Traversable } from 'fp-ts/Array';
import { fromTraversable, Iso, Lens, Optional, Prism } from 'monocle-ts';

import { propertyToKind, kindToProperty } from '../language/kinds';

/** Focus on the starting Parsimmon parse index for a Marked thing */
export const start = <T extends Pick<Mark<any>, "start">>() => Lens.fromProp<T>()('start')

/** Focus on the starting Parsimmon parse index for a Marked thing */
export const end = <T extends Pick<Mark<any>, "end">>() => Lens.fromProp<T>()('end')

/** Focus on properties of a Parsimmon parse index */
export const parseIndex = {
	/** Parse index - Line number */
	line: Lens.fromProp<Index>()("line"),

	/** Parse index - Column number */
	column: Lens.fromProp<Index>()("column"),

	/** Parse index - String offset (number of characters from beginning of string) */
	offset: Lens.fromProp<Index>()("offset")
} as const;

/** Focus on properties of teh CssLocation type from css-tree */
export const location = {
	/** File path of the document this location points to */
	file: Lens.fromProp<CssLocation>()("source"),

	/** Parse index for starting point of this declaration */
	start: start<CssLocation>(),

	/** Parse index for ending point of this declaration */
	end: end<CssLocation>()
} as const;

/** Focus on Validation metadata */
export const validation = {
	/** The contract-under-validation's name */
	contractName: Lens.fromProp<ValidationLocation>()("contractName"),

	/** The unit-under-validation's name */
	contractItemName: Lens.fromProp<ValidationLocation>()("contractItemName"),

	/** The unit-under-validation's Kind */
	contractItemKind: Lens.fromProp<ValidationLocation>()("contractItemKind"),

	/** The unit-under-validation's derived variable name, e.g. --contract-foo-bar */
	derivedVariableName: Lens.fromProp<ValidationLocation>()("derivedVariableName"),

	/** The variable-under-validation's location; may not exist if variable is not defined in theme */
	variableLocation: Optional.fromOptionProp<ValidationLocation>()("variableLocation"),

	/** The variable-under-validation's actual value; may not exist if variable is not defined in theme */
	variableValue: Optional.fromOptionProp<ValidationLocation>()("variableValue"),

	/** The contract-under-validation's location */
	contractLocation: Lens.fromProp<ValidationLocation>()("contractLocation")
} as const;

/** Focus on AST Identifiers */
export const identifier = {
	/** Raw string contents of an Identifier */
	value: Lens.fromProp<Marked.Identifier>()('value'),
} as const;

/** Focus on AST Kinds */
export const kind = {
	/** Raw Kind type of a marked Kind */
	value: Lens.fromProp<Marked.Kind>()('value'),

	/** Isomorphism of Property (from css-tree) <=> Kind (from AST) */
	isoProperty: new Iso<Kind, Property>(
		kindToProperty,
		propertyToKind
	)
} as const;

/** Focus on AST Units */
export const unit = {
	/** Identifier for this unit, i.e. the contract item's name */
	identifier: Lens.fromPath<Marked.Unit>()(['value', 'identifier']),

	/** Kind for this unit, i.e. the type for this contract item */
	kind: Lens.fromPath<Marked.Unit>()(['value', 'kind']),

	/** Raw derived variable value of this contract unit, e.g. --contract-foo-bar */
	variable: Lens.fromPath<Marked.Unit>()(['value', 'variable']),

	/** Traversal over contract units */
	T: fromTraversable(Traversable)<Marked.Unit>(),
} as const;

/** Focus on AST Groups */
export const group = {
	/** Identifier of this group, i.e. the grou's name */
	identifier: Lens.fromPath<Marked.Group>()(['value', 'identifier']),

	/** The statements encoded by this group, i.e. its Units */
	statements: Lens.fromPath<Marked.Group>()(['value', 'statements']),
} as const;

/** Focus on AST Statements */
export const statement = {
	/** Narrow focus to statements that are Units, i.e. name:type entries */
	unit: Prism.fromPredicate<Marked.Statement, Marked.Unit>(function (
		statement
	): statement is Marked.Unit {
		return statement.value.type === 'Unit';
	}),

	/** Narrow focus to statements that are groups, i.e. recursive entries */
	group: Prism.fromPredicate<Marked.Statement, Marked.Group>(function (
		statement
	): statement is Marked.Group {
		return statement.value.type === 'Group';
	}),

	/** Traversal over groups */
	T: fromTraversable(Traversable)<Marked.Statement>(),
} as const;
