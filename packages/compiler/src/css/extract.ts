import * as csstree from "css-tree";

import { Marked } from "../language/astMarked";
import { Contract } from "../language/grammar";
import { locate, type Located } from "../language/located";

export function extractContractsFromCss(css: string, filename?: string): Located<csstree.CssLocation, Marked.Group>[] {
	const ast = csstree.parse(css, { positions: true, filename });

	const commentBlocks = csstree.findAll(ast, function (node) {
		return node.type === "Comment";
	}) as csstree.Comment[];

	return commentBlocks.map(function (block: csstree.Comment) {
		return locate(
			block.loc,
			Contract.tryParse(block.value)
		);
	});
}

export function extractVariablesFromCss(css: string, filename?: string) {
	const ast = csstree.parse(css, { positions: true, filename });

	const variables = [] as Located<csstree.CssLocation, [string, string]>[];

	csstree.walk(ast, {
		visit: 'Declaration',
		enter: function (node) {
			const location = node.loc;
			const identifier = node.property;
			const value = node.value;

			// TODO: css-tree parses custom-properties as type "Raw" without the
			// `parseCustomProperty` flag -- this is convenient because it lets us quickly locate
			// declarations that are variables. But it's probably kind of hack. Revisit in the future.
			if (value.type !== "Raw") {
				return;
			}

			variables.push(
				locate(location, [identifier, value.value])
			);
		}
	});

	return variables;
}
