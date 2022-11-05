import type { CssLocation } from 'css-tree';

import type { Marked } from '../language/astMarked';

import { pipe, flow } from 'fp-ts/function';
import { map } from 'fp-ts/Array';

import { locate, unlocate } from '../language/located';
import { collectUnits } from '../optics/collect';
import { validateKind } from './kind';
import { Located } from '../language/located';
import * as L from '../optics/lenses';

const unwindVariableLocation = ([location, [variable, value]]: [
	CssLocation,
	[string, string]
]): [string, Located<CssLocation, string>] => {
	return [variable, locate(location, value)];
};

const validateUnit =
	(contractLocation: CssLocation) =>
	(variables: Record<string, Located<CssLocation, string>>) =>
	(unit: Marked.Unit) => {
		const name = L.unit.identifier.composeLens(L.identifier.value).get(unit)
		const variable = L.unit.variable.get(unit);
		const property = L.unit.kind
			.composeLens(L.kind.value)
			.composeIso(L.kind.isoProperty)
			.get(unit);

		console.log();
		if (variable in variables) {
			console.log(`✅ Contract item [${name}] is fulfilled by variable in [./${variables[variable].location.source}] on line ${variables[variable].location.start.line}`);
		} else {
			console.log(`❌ Contract item [${name}] is unfulfilled!`);
			console.log();
			console.log(`   [${name}] derived as custom property [${variable}]`);
			console.log(`   is defined by the contract in [./${contractLocation.source}] on line ${unit.start.line}.`);
			console.log();
			const filesChecked = Object.values(variables).map(function (checkedVar) {
				const [location, _] = unlocate(checkedVar);
				return location.source;
			});
			console.log(`   Files checked include: [./${filesChecked[0]}]`)
		}

		// console.log("---");
		// console.log("Validating a unit against " + variables.length + " variables");
		// console.log(variable);
		// console.log(property);

		// if (!variables.has(variable)) {
		// 	return "Variable Not Defined Error";
		// } else {
		// 	return validateKind(kind, variables.get(variable));
		// }
	};

export const validateContractWithVariables = (
	contract: Located<CssLocation, Marked.Group>,
	variables: Located<CssLocation, [string, string]>[]
) => {
	const [contractLocation, group] = unlocate(contract);
	const variableMap = Object.fromEntries(
		map(flow(unlocate, unwindVariableLocation))(variables)
	);

	pipe(
		collectUnits(group),
		map(validateUnit(contractLocation)(variableMap))
	);
};
