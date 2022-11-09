import type { CssLocation } from 'css-tree';

import type { Marked } from '../language/astMarked';
import type { ErrorLocation, Validation, VariableMap } from './validation';

import { pipe } from 'fp-ts/function';
import { map } from 'fp-ts/Array';
import { map as mapOption } from 'fp-ts/Option';
import { fst, snd } from 'fp-ts/Tuple';
import { Optional } from 'monocle-ts';

import { locate, unlocate } from '../language/located';
import { collectUnits } from '../optics/collect';
import { validateProperty } from './property';
import { Located } from '../language/located';
import * as L from '../optics/lenses';

const variableOption = Optional.fromNullableProp<VariableMap>();

/**
 * This confusingly-named function turns a Located (variable, value) tuple
 * into a (variable, Located value) tuple.
 *
 * @param input
 * @returns
 */
const transposeVariableLocation = (
	input: Located<CssLocation, [string, string]>
): [string, Located<CssLocation, string>] => {
	const [location, [variable, value]] = unlocate(input);
	return [variable, locate(location, value)];
};

const validateUnit =
	(contractLocation: CssLocation) =>
	(variables: VariableMap) =>
	(unit: Marked.Unit): Located<ErrorLocation, Validation[]> => {
		// Construct all the things we could possibly need to evaluate this contract
		// statement, e.g. values, properties, themes, locations, contracts, etc.

		/** The name of the contract item to evalute, e.g. "spacing" or "textColor" */
		const contractItemName = L.unit.identifier
			.composeLens(L.identifier.value)
			.get(unit);

		/**
		 * We have the location the contract is defined from `contractLocation`, but the `unit`
		 * itself actually contains what _line_ the item is defined on, which is useful. So combine them.
		 * Conveniently the Marked type duck-types to the CssLocation type from css-tree.
		 */
		const contractItemLocation: CssLocation = {
			source: contractLocation.source,
			start: L.start.get(unit),
			end: L.end.get(unit),
		};

		/** The name of the variable that is derived from this contract, e.g. "--anchor-spacing" */
		const derivedVariableName = L.unit.variable.get(unit);

		/** The type for this variable as defined in the source contract */
		const propertyType = L.unit.kind
			.composeLens(L.kind.value)
			.composeIso(L.kind.isoProperty)
			.get(unit);

		const actualVariable = mapOption(unlocate)(
			variableOption(derivedVariableName).getOption(variables)
		);

		/** The location for this variable as derived form the input theme (May not exist) */
		const actualVariableLocation = mapOption(fst)(actualVariable);

		/** The actual value for this variable as derived form the input theme (May not exist) */
		const actualVariableValue = mapOption(snd)(actualVariable);

		const errorLocation: ErrorLocation = {
			variableLocation: actualVariableLocation,
			contractLocation: contractItemLocation,
		};

		// Begin validations
		return locate(errorLocation, [
			// Validates that the type of the variable matches the type defined in the contract
			validateProperty(propertyType, actualVariableValue),
		]);
	};

export const validateContractWithVariables =
	(variables: Located<CssLocation, [string, string]>[]) =>
	(contract: Located<CssLocation, Marked.Group>) => {
		const [contractLocation, group] = unlocate(contract);
		const variableMap = Object.fromEntries(
			map(transposeVariableLocation)(variables)
		);

		return pipe(
			collectUnits(group),
			map(validateUnit(contractLocation)(variableMap))
		);
	};
