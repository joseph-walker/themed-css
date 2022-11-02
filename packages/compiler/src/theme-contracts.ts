import { promisify } from "util";
import { Command } from "commander";
import { parse } from 'css-tree';
import { glob as globCB } from "glob";

import { compileAndFold, printReport, executeContracts } from "./compiler";
import { readFile } from "fs/promises";

const glob = promisify(globCB);

const program = new Command();

program
	.name("theme-contracts")
	.description("CLI tooling for working with CSS Theme Contracts")
	.version("0.0.1");

program
	.command("check")
	.description("Run the contract validator on your CSS")
	.argument("<src>", "Location of your source CSS")
	.argument("<theme>", "Location of your theme declarations")
	.action(async function (srcGlob, themeGlob) {
		const srcFiles = await glob(srcGlob);
		const themeFiles = await glob(themeGlob);

		const contracts = await Promise.all(
			srcFiles.map((f) => readFile(f, { encoding: "utf-8" }))
		).then(
			(raw) => raw.flatMap(compileAndFold)
		);

		for (const theme of themeFiles) {
			const themeSrc = await readFile(theme, { encoding: "utf-8" });
			const report = executeContracts(contracts, parse(themeSrc));

			console.log(`Report for theme: ${theme}`);
			printReport(report);
			console.log();
		}
	});

program.parse();
