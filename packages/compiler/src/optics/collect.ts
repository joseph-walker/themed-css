import * as L from '../optics/lenses';
import { Marked } from '../language/astMarked';

export function collectUnits(group: Marked.Group): Marked.Unit[] {
	const units = L.group.statementsT
		.composePrism(L.statement.unit)
		.asFold()
		.getAll(group);

	const groups = L.group.statementsT
		.composePrism(L.statement.group)
		.asFold()
		.getAll(group);

	return units.concat(
		groups.flatMap(collectUnits)
	);
}
