import * as csstree from "css-tree";

import { Marked } from "../language/astMarked";
import { Contract } from "../language/grammar";

export function extractContractsFromCss(css: string): Marked.Group[] {
	const ast = csstree.parse(css);

	const commentBlocks = csstree.findAll(ast, function (node) {
		return node.type === "Comment";
	}) as csstree.Comment[];

	return commentBlocks.map(function (block: csstree.Comment) {
		return Contract.tryParse(block.value);
	});
}

export function extractVariablesFromCss(css: string) {
	const ast = csstree.parse(css);

	const variables = [] as [string, string][];

	csstree.walk(ast, {
		visit: 'Declaration',
		enter: function (node) {
			const identifier = node.property;
			const value = node.value;

			// TODO: As far as I can tell css-tree always makes CSSVariables (css-custom-properties)
			// return with a Node of type Raw. But that may not be entirely accurate. Need to investigate.
			if (value.type !== "Raw") {
				return;
			}

			variables.push([identifier, value.value]);
		}
	});

	return variables;
}
