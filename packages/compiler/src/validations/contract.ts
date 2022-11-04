import { Marked } from '../language/astMarked';
import { collectUnits } from '../optics/collect';
import * as L from '../optics/lenses';

import { pipe } from 'fp-ts/function';
import { map } from 'fp-ts/Array';
import { validateKind } from './kind';

type Variables = Map<string, string>;

const validateUnit = (variables: Variables) => (unit: Marked.Unit) => {
	const variable = L.unit.variable.get(unit);
	const kind = L.unit.kind.get(unit);

	if (!variables.has(variable)) {
		return "Variable Not Defined Error";
	} else {
		return validateKind(kind, variables.get(variable));
	}
};

export const validateContractWithVariables =
	(contract: Marked.Group, variables: Variables) => {
		return pipe(
			collectUnits(contract),
			map(validateUnit(variables))
		);
	};
