import { validateDeclaration } from 'csstree-validator';

import { Marked } from '../language/astMarked';
import * as L from '../optics/lenses';

export const validateKind = (kind: Marked.Kind, value: string) => {
	const property = L.kind.value.composeIso(L.kind.isoProperty).get(kind);
	const validationResult = validateDeclaration(property, value);

	return "Error if the result of validation is an error";
};
