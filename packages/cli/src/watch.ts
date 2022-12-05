import chokidar from 'chokidar';
import { concatMap, from, map, Observable, of, pairwise, tap } from 'rxjs';
import { resolve } from 'path';
import { readFile } from 'fs/promises';
import {
	extractContractsFromCss,
	extractVariablesFromCss,
	Located,
	unlocate
} from '@theme-contracts/compiler';
import { Eq } from 'fp-ts/Eq'
import { difference } from 'fp-ts/ReadonlyArray'

const eqVariable: Eq<Located<unknown, [string, string]>> = {
	equals(a, b) {
		const [_a, valueA] = unlocate(a)
		const [_b, valueB] = unlocate(b)

		return valueA[0] === valueB[0] && valueA[1] === valueB[1]
	}
}

const openFile = (s) => readFile(s, { encoding: 'utf-8' });

type FileEvent = {
	event: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';
	path: string;
};

const contracts = new Observable<FileEvent>(function (subscriber) {
	chokidar
		.watch('./sample-app/styles/*.module.css')
		.on('all', function (event, path) {
			subscriber.next({ event, path });
		});
}).pipe(
	concatMap(async function ({ path }) {
		const css = await openFile(resolve(path));
		return extractContractsFromCss(css, path);
	})
);

const themes = new Observable<FileEvent>(function (subscriber) {
	chokidar
		.watch('./sample-app/themes/*.css')
		.on('all', function (event, path) {
			subscriber.next({ event, path });
		});
}).pipe(
	concatMap(async function ({ path }) {
		const css = await openFile(resolve(path));
		return extractVariablesFromCss(css, path);
	}),
	pairwise(),
	map(function ([variablesOld, variablesNew]) {
		return difference(eqVariable)(variablesOld)(variablesNew)
	})
);

// contracts.subscribe(function (next) {
// 	console.log(next);
// });

themes.subscribe(function (next) {
	console.log(next);
	console.log("---")
});
