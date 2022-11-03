import { ContractGrammar } from './language/grammar';
import { foldVariables } from './optics/folds';

const sample = ContractGrammar.Contract.tryParse(`
@contract example {
	foo: color
	bar: dimension
	bar {
		baz: color
		hover {
			link: flex-alignment
		}
	}
}`);

console.log(
	foldVariables(sample)
);
