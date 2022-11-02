import * as csstree from 'css-tree';

import { parse, fold, type Contract, type UnitType } from "./parser";

export function compile(css: string): Contract[] {
	const ast = csstree.parse(css);

	const commentBlocks = csstree.findAll(ast, function (node) {
		return node.type === "Comment";
	}) as csstree.Comment[];

	return commentBlocks.map(function (block: csstree.Comment) {
		return parse(block.value);
	});
}

export function compileAndFold(css: string): [string, UnitType][] {
	return compile(css).flatMap(fold);
}

function isValidType(type: UnitType, value: string): boolean {
	switch (type) {
		case "Color":
			return (/#[a-f\d]{6}/i).test(value);
		case "Dimension":
			return (/\d+?(?:px|rem)/i).test(value);
		case "FlexAlignment":
			return (/(?:flex-end|flex-start|center)/i).test(value);
		case "Number":
			return (/\d+/).test(value);
		default:
			return false;
	}
}

export function buildCssTree(src: string): csstree.CssNode {
	return csstree.parse(src);
}

export function executeContracts(contracts: [string, UnitType][], ast: csstree.CssNode) {
	const contractChecklist = Object.fromEntries(
		contracts.map(function ([name, type]) {
			return [name, { type, value: undefined as string, visited: false, legal: true as boolean | string }]
		})
	);

	csstree.walk(ast, {
		visit: 'Declaration',
		enter: function (node) {
			if (node.value.type !== "Raw") {
				throw new Error(`Encountered unexpected variable type: ${node.value.type}`);
			}

			if (node.property in contractChecklist) {
				const checklistItem = contractChecklist[node.property];

				checklistItem.visited = true;
				checklistItem.value = node.value.value;
				checklistItem.legal = isValidType(checklistItem.type, node.value.value)
					? true
					: `Invalid type - expected [${checklistItem.type}], found [${node.value.value.trim()}]`;
			} else if ((/--[a-z\-]+/).test(node.property)) {
				contractChecklist[node.property] = {
					type: "Unknown",
					value: node.value.value,
					visited: true,
					legal: `Found variable ${node.property}, but found no matching contract declaration`
				}
			}
		}
	});

	return contractChecklist;
}

export function printReport(reports: ReturnType<typeof executeContracts>) {
	for (const [varName, report] of Object.entries(reports)) {
		if (report.visited === false) {
			console.log(`✕ ${varName}`);
			console.log("  Missing declaration");
		} else if (report.legal !== true) {
			console.log(`⚠ ${varName}`);
			console.log(`  ${report.legal}`);
		} else {
			console.log(`✓ ${varName}`);
		}
	}
}
