import { promisify } from 'util';
import { Command } from 'commander';
import { glob as globCB } from 'glob';

import { extractContractsFromCss, extractVariablesFromCss, validateContractWithVariables } from "@theme-contracts/compiler";

import { readFile } from 'fs/promises';

const glob = promisify(globCB);

const program = new Command();

const openFile = (s) => readFile(s, { encoding: 'utf-8' });

async function runExtractContract(filename: string) {
	const css = await openFile(filename);
	return extractContractsFromCss(css, filename)
}

async function runExtractThemes(filename: string) {
	const css = await openFile(filename);
	return extractVariablesFromCss(css, filename);
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
		const contracts = (await Promise.all(srcFiles.flatMap(runExtractContract))).flat();

		const themeFiles = await glob(themeGlob);
		const themeVariables = (await Promise.all(themeFiles.flatMap(runExtractThemes))).flat();

		// console.log(JSON.stringify(contracts, null, 4));
		// console.log(JSON.stringify(themeVariables, null, 4));

		validateContractWithVariables(contracts[0], themeVariables);
	});

program.parse();
