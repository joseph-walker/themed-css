import allProperties from "mdn-data/css/properties.json";

type OmitBrowserSpecificProperties<T extends string> = T extends `-${infer _}`
	? never
	: T

type PascalCase<T extends string> = T extends `${infer Head}-${infer Tail}`
	? `${Capitalize<Head>}${Capitalize<PascalCase<Tail>>}`
	: Capitalize<T>

export type Property = OmitBrowserSpecificProperties<keyof typeof allProperties>
export type Kind = PascalCase<Property>

export function kebabCaseToPascalCase<T extends string>(kebab: T) {
	return kebab.replaceAll(/(^.|-.)/g, (match) => match.at(-1).toUpperCase()) as PascalCase<T>;
}

export function pascalCaseToKebabCase(pascal: string) {
	return pascal.replaceAll(/([A-Z])/g, (match) => "-" + match.toLowerCase()).slice(1);
}

export const properties = Object.keys(allProperties).filter((p): p is Property => p[0] != '-');
export const kinds: Kind[] = properties.map(kebabCaseToPascalCase);
