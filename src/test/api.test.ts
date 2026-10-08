import { parseGrammarText, validateCNF, runCYK } from '../algorithms/cyk.ts';

// Test validating CNF with edge cases
const g1 = parseGrammarText('S -> AB | BC\nA -> BA | a\nB -> CC | b\nC -> AB | a');
const v1 = validateCNF(g1.grammar, 'S');
if (!v1.valid) throw new Error('v1 should be valid');

const res = runCYK(g1.grammar, 'S', 'baaba');
if (!res.accepted) throw new Error('baaba should be accepted');
if (res.table[0][4].nonTerminals.length === 0) throw new Error('root cell must have derivations');

console.log('✅ API internal algorithm integration test passed');
