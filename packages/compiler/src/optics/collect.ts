import * as L from '../optics/lenses';
import { Marked } from '../language/astMarked';

export function collectUnits<T extends L.WithStatements>(group: T): Marked.Unit[] {
	const units = L.withStatements.statementsT
		.composePrism(L.statement.unit)
		.asFold()
		.getAll(group);

	const groups = L.withStatements.statementsT
		.composePrism(L.statement.group)
		.asFold()
		.getAll(group);

	return units.concat(
		groups.flatMap(collectUnits)
	);
}
