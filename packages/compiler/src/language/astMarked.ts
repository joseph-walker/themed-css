/**
 * Re-export the entire AST decorated with marks. These marks are added by the parser
 * and include parser  metadata such as line and column number and character offset count.
 */

import type { O } from 'ts-toolbelt';
import type { Mark } from 'parsimmon';

import type { Origin } from './ast';

export namespace Marked {
	export type Identifier = Mark<Origin.Identifier>;

	export type Kind = Mark<Origin.Kind>;

	export type Statement = Unit | Group;

	export type Unit = Mark<
		O.Overwrite<Origin.Unit, { kind: Kind; identifier: Identifier }>
	>;

	export type Group = Mark<
		O.Overwrite<
			Origin.Group,
			{ identifier: Identifier; statements: Statement[] }
		>
	>;
}
