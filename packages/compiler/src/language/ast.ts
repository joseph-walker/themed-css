import type { Kind as RootKind } from './kinds';

export namespace Origin {
	/**
	 * Each non-primitive element of the Contract AST is tagged with a type to simplify
	 * traversal and consumption of the AST.
	 */
	type Node<T extends string> = { type: T };

	/**
	 * Identifiers are a subset of strings containing upper and lowercase numbers
	 * and no symbols. For simplicity in type consumption, they're typed as `string`.
	 *
	 * @example
	 * anchor
	 * hover
	 * fooBarBaz
	 */
	export type Identifier = string;

	/**
	 * Represents the types that are representable in a theme contract. String literals.
	 * `type` is reserved by the root Node<T>, so it can't be reused for definining the type of a Unit.
	 * Better instead to ust use a synonym for `type` - like Kind.
	 *
	 * @example
	 * Dimension
	 * Color
	 */
	export type Kind = RootKind;

	/**
	 * A unit represents a key/value pair for typing a variable within a contract.
	 *
	 * @example
	 * { identifier: "color", kind: "Color" }
	 * { identifier: "padding", kind: "Padding", variable: "--anchor-hover-padding" }
	 */
	export type Unit = Node<'Unit'> & {
		identifier: Identifier;
		kind: Kind;
	};

	/**
	 * A Group is a collection of statements, like a Map - but with a name that's less likely to confuse
	 * the IDE consuming the types. Represents the entries in a contract. Groups can be nested since
	 * Statements can be Groups.
	 *
	 * @example
	 * { identifier: "hover", statements: [ { identifier: "color", kind: "Color" } ] }
	 */
	export type Group = Node<'Group'> & {
		identifier: Identifier;
		statements: Statement[];
	};

	/**
	 * A statement is a discriminated union that represents the entries in a contract. Since Groups
	 * can contain Statements and Statements can be Groups, the Contract AST is self-referentially recursive
	 * and infinitely nested Contracts are constructable and representable.
	 *
	 * @example
	 * { identifier: color, kind: Color }
	 * { identifier: hover, statements: [ { identifier: color, kind: Color } ] }
	 */
	export type Statement = Unit | Group;

	/**
	 * A Contract is a special Group with a unique tag - it represents the root Group defining the contract.
	 * The Contract type represents the contract in its entirety and is the entry point for consuming its statements.
	 */
	export type Contract = Node<'Contract'> & {
		identifier: Identifier;
		statements: Statement[];
	};
}
