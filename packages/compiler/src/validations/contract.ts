import { Marked } from '../language/astMarked';
import { collectUnits } from '../optics/collect';
import * as L from '../optics/lenses';

import { pipe, flow } from 'fp-ts/function';
import { map } from 'fp-ts/Array';

type Variables = {
	//
};

type Declaration = [Marked.Identifier, Marked.Kind];

function validateDeclaration([identifier, kind]: Declaration) {

}

function unitToDeclaration(unit: Marked.Unit): Declaration {
	return [L.unit.identifier.get(unit), L.unit.kind.get(unit)];
}

export function validateContractWithVariables(
	contract: Marked.Contract,
	variables: Variables
) {
	const contractDeclarations = pipe(
		collectUnits(contract),
		map(flow(unitToDeclaration, validateDeclaration))
	);
}
