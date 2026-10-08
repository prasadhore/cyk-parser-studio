import {
  parseGrammarText,
  validateCNF,
  runCYK,
  EXAMPLE_LIBRARY,
  generateRandomExample,
} from '../algorithms/cyk.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- Running CYK Algorithm Test Suite ---');

// Test 1: Classic Hopcroft & Ullman Example
const classic = EXAMPLE_LIBRARY.find((e) => e.id === 'default-classic')!;
const parsedClassic = parseGrammarText(classic.grammarText);
const valClassic = validateCNF(parsedClassic.grammar, classic.startSymbol);
assert(valClassic.valid, 'Classic grammar is valid CNF');
assert(valClassic.errors.length === 0, 'No validation errors on classic grammar');

const resClassic = runCYK(parsedClassic.grammar, classic.startSymbol, classic.input);
assert(resClassic.accepted === true, 'Classic grammar accepts "baaba"');
assert(resClassic.table.length === 5, 'Classic table has dimension 5x5');
assert(resClassic.rootNonTerminals.includes('S'), 'Root cell T[0][4] contains S');
console.log(`  Execution time: ${resClassic.executionTimeMs} ms, Total steps: ${resClassic.steps.length}`);

// Test 2: Classic Grammar with rejected string
const resClassicReject = runCYK(parsedClassic.grammar, classic.startSymbol, 'bbbbb');
assert(resClassicReject.accepted === false, 'Classic grammar rejects "bbbbb"');

// Test 3: Invalid CNF detection (rule with 3 non-terminals: S -> ABC)
const invalidGrammar = `S -> ABC
A -> a
B -> b
C -> c`;
const parsedInvalid = parseGrammarText(invalidGrammar);
const valInvalid = validateCNF(parsedInvalid.grammar, 'S');
assert(!valInvalid.valid, 'Correctly flags S -> ABC as invalid CNF');
assert(
  valInvalid.errors.some((e) => e.problem.includes('3 symbols')),
  'Provides specific problem description for length 3 rule'
);

// Test 4: Invalid CNF detection (unit production: S -> A)
const unitGrammar = `S -> A
A -> a`;
const parsedUnit = parseGrammarText(unitGrammar);
const valUnit = validateCNF(parsedUnit.grammar, 'S');
assert(!valUnit.valid, 'Correctly flags unit production S -> A');
assert(
  valUnit.errors.some((e) => e.problem.includes('Unit production')),
  'Provides specific diagnosis for unit production'
);

// Test 5: Single-character input
const resSingleA = runCYK(parsedClassic.grammar, 'A', 'a');
assert(resSingleA.accepted === true, 'Single character "a" accepted by A');

// Test 6: Ambiguous grammar
const ambiguous = EXAMPLE_LIBRARY.find((e) => e.id === 'ambiguous-grammar')!;
const parsedAmbiguous = parseGrammarText(ambiguous.grammarText);
const resAmbiguous = runCYK(parsedAmbiguous.grammar, ambiguous.startSymbol, ambiguous.input);
assert(resAmbiguous.accepted === true, 'Ambiguous grammar accepts "aaa"');

// Test 7: Random example generator
const randomEx = generateRandomExample();
const parsedRandom = parseGrammarText(randomEx.grammarText);
const valRandom = validateCNF(parsedRandom.grammar, randomEx.startSymbol);
assert(valRandom.valid, 'Generated random grammar is strictly valid CNF');
const resRandom = runCYK(parsedRandom.grammar, randomEx.startSymbol, randomEx.input);
assert(typeof resRandom.accepted === 'boolean', 'Random example runs CYK without error');

console.log('--- All 7 Test Scenarios Passed Successfully! ---');
