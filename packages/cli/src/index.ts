import { promisify } from 'util';
import { Command } from 'commander';
import { glob as globCB } from 'glob';
import { readFile } from 'fs/promises';
import { getBorderCharacters, table, TableUserConfig } from 'table';
import { pipe } from "fp-ts/function";
import { getOrElse, sequenceArray, map } from "fp-ts/Option";
import chalk from "chalk";

import {
	extractContractsFromCss,
	extractVariablesFromCss,
	unlocate,
	Optics as L,
	Located,
	validateContractWithVariables,
	ValidationLocation,
	Validation,
} from '@theme-contracts/compiler';

type ReportRow = [string, string, string, string, string, string];

const glob = promisify(globCB);

const program = new Command();

const openFile = (s) => readFile(s, { encoding: 'utf-8' });

const join = (xs: string[]) => xs.join(":");

async function runExtractContract(filename: string) {
	const css = await openFile(filename);
	return extractContractsFromCss(css, filename);
}

async function runExtractThemes(filename: string) {
	const css = await openFile(filename);
	return extractVariablesFromCss(css, filename);
}

function formatValidationForPrinting(validation: Validation) {
	let message: string[];

	switch (validation.result.type) {
		case "Ok":
			message = [chalk.green`✓ ${validation.name}`];
			break;
		case "Warning":
			message = [chalk.yellow`! ${validation.name}`, `  ${validation.result.message}`];
			break;
		case "Error":
			message = [chalk.red`× ${validation.name}`, `  ${validation.result.message}`];
			break;
	}

	return message.join("\n");
}

function formatReportForPrinting(
	report: Located<ValidationLocation, Validation[]>
): ReportRow {
	const [meta, validationResult] = unlocate(report);

	const variableLocation = pipe(
		[
			L.validation.variableLocation
				.composeLens(L.location.file)
				.getOption(meta),
			map((n) => `${n}`)(
				L.validation.variableLocation
					.composeLens(L.location.start)
					.composeLens(L.parseIndex.line)
					.getOption(meta)
			),
		],
		sequenceArray,
		map(join),
		getOrElse(() => "<unknown>")
	);

	const contractLocation = pipe(
		[
			L.validation.contractLocation
				.composeLens(L.location.file)
				.get(meta),
			L.validation.contractLocation
				.composeLens(L.location.start)
				.composeLens(L.parseIndex.line)
				.get(meta)
		],
		join
	);

	const lineItems = validationResult.map(formatValidationForPrinting).join("\n");

	return [
		L.validation.contractName.get(meta),
		L.validation.contractItemName.get(meta),
		contractLocation,
		L.validation.derivedVariableName.get(meta),
		variableLocation,
		lineItems
	];
}

program
	.name('theme-contracts')
	.description('CLI tooling for working with CSS Theme Contracts')
	.version('0.1.0');

program
	.command('check')
	.description('Run the contract validator on your CSS')
	.argument('<src>', 'Location of your source CSS')
	.argument('<theme>', 'Location of your theme declarations')
	.action(async function (srcGlob, themeGlob) {
		const srcFiles = await glob(srcGlob);
		const contracts = (
			await Promise.all(srcFiles.flatMap(runExtractContract))
		).flat();

		const themeFiles = await glob(themeGlob);
		const themeVariables = (
			await Promise.all(themeFiles.flatMap(runExtractThemes))
		).flat();

		// Do the actual validation
		const reports = contracts.flatMap(
			validateContractWithVariables(themeVariables)
		);

		// Format the report for printing to the terminal
		const printableReport = reports.map(formatReportForPrinting);

		// Begin formatting
		// Table column headers
		const header = ["Contract", "Unit", "Contract Location", "Variable", "Variable Location", "Checks"].map(s => chalk.cyan.bold`${s}`);

		// I want a custom border color, so use honeywell as a base
		const baseBorder = getBorderCharacters('honeywell');
		const customBorder = {}
		for (const k in baseBorder) {
			customBorder[k] = chalk.gray`${baseBorder[k]}`
		}

		// Configure output table
		const tableConfig: TableUserConfig = {
			border: customBorder,
			drawVerticalLine: () => false,
			header: {
				alignment: "left",
				content: chalk.blue`Validation report for [${themeGlob}]`
			}
		};

		// Print the report
		console.log(table([header].concat(printableReport), tableConfig));
	});

program.parse();
