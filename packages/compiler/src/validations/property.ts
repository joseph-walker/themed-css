// @ts-expect-error csstree-validator has no @types package :(
import { validateDeclaration } from 'csstree-validator';

import { pipe, identity } from 'fp-ts/function';
import { type Either, fromOption, chain, left, right, foldW } from 'fp-ts/Either';
import { type Option } from 'fp-ts/Option';

import { Property } from '../language/kinds';
import { type Validation, type Error, type Warning, type Ok, error, warning, ok } from '../data/validation';

// This is the type of the error from `validateDeclaration`
// No idea if it's correct.
// TODO: Figure out if this is correct.
type CssSyntaxError = {
	message: string;
	syntax: string;
}

const validateDeclarationFixed = (property: Property) => (value: string): Either<Error | Warning, Ok> => {
	const errors: CssSyntaxError[] = validateDeclaration(property, value);

	if (errors.length > 0) {
		return left({ type: "Error", message: errors[0]!.message})
	} else {
		return right(ok());
	}
}

export const validateProperty = (property: Property, value: Option<string>): Validation => {
	const validationName = "Typecheck";

	return pipe(
		value,
		fromOption(() => error("Variable not defined in contract" )),
		chain(validateDeclarationFixed(property)),
		foldW(identity, identity),
		result => ({ result, name: validationName })
	);
};
