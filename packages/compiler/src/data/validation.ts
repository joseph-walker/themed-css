import type { Option } from 'fp-ts/Option';
import type { CssLocation } from 'css-tree';

import type { Located } from './located';
import { Kind } from '../language/kinds';

export type ValidationLocation = {
	contractName: string;
	contractItemName: string;
	contractItemKind: Kind;
	derivedVariableName: string;
	variableLocation: Option<CssLocation>;
	variableValue: Option<string>;
	contractLocation: CssLocation;
};

type TaggedValidationResult<T extends string> = {
	type: T;
};

type WithMessage = {
	message: string;
}

export type Ok = TaggedValidationResult<'Ok'>;
export type Warning = TaggedValidationResult<'Warning'> & WithMessage;
export type Error = TaggedValidationResult<'Error'> & WithMessage;

export type ValidationResult = Ok | Warning | Error;

export type Validation = {
	result: ValidationResult;
	name: string;
}

export type VariableMap = Record<string, Located<CssLocation, string>>;

export function ok(): Ok {
	return { type: "Ok" };
}

export function warning(message: string): Warning {
	return { type: "Warning", message }
}

export function error(message: string): Error {
	return { type: "Error", message }
}
