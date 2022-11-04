import * as ContractGrammar from "./language/grammar";

const sample = `anchor { fill: Color }`

const parsed = ContractGrammar.Group.tryParse(sample);

console.log(parsed);
