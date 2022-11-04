import * as ContractGrammar from "./language/grammar";
import { projectToUnmarked } from "./optics/project";

const sample = `@contract anchor { fill: Color }`

const parsed = ContractGrammar.Contract.tryParse(sample);

console.log(
	JSON.stringify(projectToUnmarked(parsed), null, 4)
);
