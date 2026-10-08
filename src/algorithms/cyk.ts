import {
  CNFGrammar,
  CYKCell,
  CYKResult,
  CYKStep,
  Derivation,
  ExampleCase,
  ParseTreeNode,
  Production,
  ValidationError,
  ValidationResult,
} from '../types/cyk.ts';

/**
 * Normalizes grammar input string into a structured dictionary of productions.
 * Supports:
 * - 'S -> AB | BC'
 * - 'S → AB'
 * - Multiple lines
 * - Cleans whitespace and blank lines
 */
export function parseGrammarText(text: string): {
  grammar: CNFGrammar;
  startSymbol: string;
  allProductions: Production[];
  rawLines: string[];
} {
  const grammar: CNFGrammar = {};
  const allProductions: Production[] = [];
  const lines = text.split('\n');
  let firstLhs = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
      continue;
    }

    // Split on -> or →
    const separator = trimmed.includes('→') ? '→' : '->';
    if (!trimmed.includes(separator)) {
      continue;
    }

    const [lhsRaw, rhsRaw] = trimmed.split(separator);
    const lhs = lhsRaw.trim();
    if (!lhs) continue;

    if (!firstLhs) {
      firstLhs = lhs;
    }

    if (!grammar[lhs]) {
      grammar[lhs] = [];
    }

    const alternatives = rhsRaw.split('|').map((alt) => alt.trim()).filter(Boolean);
    for (const alt of alternatives) {
      if (!grammar[lhs].includes(alt)) {
        grammar[lhs].push(alt);
      }
      allProductions.push({
        lhs,
        rhs: alt,
        isTerminal: alt.length === 1 && !/^[A-Z]$/.test(alt),
      });
    }
  }

  return {
    grammar,
    startSymbol: firstLhs || 'S',
    allProductions,
    rawLines: lines,
  };
}

/**
 * Formats a grammar dictionary back to readable string text.
 */
export function formatGrammarText(grammar: CNFGrammar): string {
  return Object.entries(grammar)
    .map(([lhs, rhss]) => `${lhs} -> ${rhss.join(' | ')}`)
    .join('\n');
}

/**
 * Validates whether a grammar is in strict Chomsky Normal Form (CNF):
 * A -> BC (two non-terminals)
 * or
 * A -> a (single terminal)
 */
export function validateCNF(
  grammar: CNFGrammar,
  startSymbol = 'S'
): ValidationResult {
  const errors: ValidationError[] = [];
  const nonTerminalsSet = new Set<string>(Object.keys(grammar));
  const terminalsSet = new Set<string>();
  let totalProductions = 0;

  if (Object.keys(grammar).length === 0) {
    errors.push({
      problem: 'Grammar is empty.',
      suggestion: 'Add at least one production rule, e.g., S -> AB | a',
    });
    return {
      valid: false,
      errors,
      normalizedGrammar: grammar,
      nonTerminals: [],
      terminals: [],
      totalProductions: 0,
    };
  }

  if (!grammar[startSymbol]) {
    errors.push({
      problem: `Start symbol '${startSymbol}' has no production rules defined.`,
      suggestion: `Ensure '${startSymbol}' appears on the left-hand side of at least one rule.`,
    });
  }

  // Helper to check if a symbol looks like a non-terminal (single uppercase letter or word like NP, VP, S)
  const isNonTerminal = (sym: string): boolean => {
    return /^[A-Z][A-Z0-9]*$/.test(sym);
  };

  for (const [lhs, rhss] of Object.entries(grammar)) {
    if (!isNonTerminal(lhs)) {
      errors.push({
        production: `${lhs} -> ...`,
        problem: `Left-hand side '${lhs}' must be a valid Non-Terminal (uppercase letter like S, A, B).`,
        suggestion: `Rename '${lhs}' to an uppercase identifier, e.g., 'S' or 'A'.`,
      });
    }

    if (rhss.length === 0) {
      errors.push({
        production: `${lhs} -> <empty>`,
        problem: `Non-terminal '${lhs}' has no right-hand side alternatives.`,
        suggestion: `Specify at least one production for '${lhs}', e.g., '${lhs} -> a'.`,
      });
    }

    for (const rhs of rhss) {
      totalProductions++;
      const prodStr = `${lhs} -> ${rhs}`;

      // Check epsilon / empty
      if (rhs === 'ε' || rhs === 'epsilon' || rhs === '' || rhs === 'e') {
        errors.push({
          production: prodStr,
          problem: 'Epsilon (empty string) productions are not allowed in standard Chomsky Normal Form.',
          suggestion: 'Remove epsilon transitions or compute an epsilon-free CNF grammar equivalent.',
        });
        continue;
      }

      // Check single character
      if (rhs.length === 1) {
        // If it's a single uppercase letter, it's a unit production: A -> B
        if (/^[A-Z]$/.test(rhs)) {
          errors.push({
            production: prodStr,
            problem: `Unit production detected: '${lhs} -> ${rhs}'.`,
            suggestion: `In CNF, a single symbol on the right-hand side must be a terminal (e.g., '${lhs} -> a'), not a single non-terminal. Substitute '${rhs}' with its derivations.`,
          });
        } else {
          // Valid terminal production: A -> a
          terminalsSet.add(rhs);
        }
        continue;
      }

      // Check length 2: Should be two non-terminals, e.g. AB
      if (rhs.length === 2) {
        const c1 = rhs[0];
        const c2 = rhs[1];

        const c1IsNT = /^[A-Z]$/.test(c1);
        const c2IsNT = /^[A-Z]$/.test(c2);

        if (c1IsNT && c2IsNT) {
          // Check if both non-terminals are defined somewhere
          nonTerminalsSet.add(c1);
          nonTerminalsSet.add(c2);
          continue; // Valid CNF: A -> BC
        }

        if (!c1IsNT && !c2IsNT) {
          errors.push({
            production: prodStr,
            problem: `Right-hand side contains two terminals: '${rhs}'.`,
            suggestion: `Replace terminals with non-terminals: introduce X -> ${c1} and Y -> ${c2}, then write ${lhs} -> XY.`,
          });
        } else {
          errors.push({
            production: prodStr,
            problem: `Mixed terminal and non-terminal in '${rhs}'.`,
            suggestion: `In CNF, binary productions must consist strictly of two non-terminals. Introduce a new rule for the terminal.`,
          });
        }
        continue;
      }

      // Length > 2 (e.g. BCD, ABC, etc.)
      if (rhs.length > 2) {
        errors.push({
          production: prodStr,
          problem: `Right-hand side '${rhs}' has ${rhs.length} symbols. CNF requires exactly two non-terminals or one terminal.`,
          suggestion: `Decompose longer rules into binary rules. For example, rewrite ${lhs} -> ${rhs} into ${lhs} -> ${rhs[0]}X and X -> ${rhs.slice(1)}.`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    normalizedGrammar: grammar,
    nonTerminals: Array.from(nonTerminalsSet),
    terminals: Array.from(terminalsSet),
    totalProductions,
  };
}

/**
 * Pure, authentic Cocke–Younger–Kasami (CYK) Dynamic Programming algorithm.
 * Fills table T[i][j] where:
 * - i: start index (0 <= i < n)
 * - j: end index (i <= j < n)
 * T[i][j] contains set of non-terminals deriving substring w[i...j].
 */
export function runCYK(
  grammar: CNFGrammar,
  startSymbol: string,
  input: string
): CYKResult {
  const startTime = performance.now();
  const n = input.length;

  if (n === 0) {
    const execTime = performance.now() - startTime;
    return {
      accepted: false,
      input: '',
      startSymbol,
      length: 0,
      table: [],
      steps: [
        {
          stepIndex: 0,
          type: 'init',
          cell: [0, 0],
          substring: '',
          length: 0,
          matched: false,
          explanation: 'Input string is empty. Standard CNF does not derive empty strings without S -> ε.',
        },
      ],
      executionTimeMs: Math.round(execTime * 100) / 100,
      grammarSize: Object.keys(grammar).length,
      nonTerminalsCount: Object.keys(grammar).length,
      rootNonTerminals: [],
      parseTree: null,
    };
  }

  // Pre-index grammar productions for fast lookup
  // terminalRules: Map terminal 'a' -> Set of LHS non-terminals that produce 'a'
  const terminalRules = new Map<string, Set<string>>();
  // binaryRules: Map 'BC' -> Set of LHS non-terminals that produce 'BC'
  const binaryRules = new Map<string, Set<string>>();
  let totalRules = 0;

  for (const [lhs, rhss] of Object.entries(grammar)) {
    for (const rhs of rhss) {
      totalRules++;
      if (rhs.length === 1 && !/^[A-Z]$/.test(rhs)) {
        if (!terminalRules.has(rhs)) terminalRules.set(rhs, new Set());
        terminalRules.get(rhs)!.add(lhs);
      } else if (rhs.length === 2 && /^[A-Z]{2}$/.test(rhs)) {
        if (!binaryRules.has(rhs)) binaryRules.set(rhs, new Set());
        binaryRules.get(rhs)!.add(lhs);
      }
    }
  }

  // Initialize table: n x n matrix of CYKCell
  const table: CYKCell[][] = [];
  for (let i = 0; i < n; i++) {
    table[i] = [];
    for (let j = 0; j < n; j++) {
      table[i][j] = {
        i,
        j,
        length: j - i + 1,
        substring: input.slice(i, j + 1),
        nonTerminals: [],
        derivations: [],
      };
    }
  }

  const steps: CYKStep[] = [];
  let stepCounter = 1;

  // STEP 1: Base Case - Substring length l = 1 (T[i][i])
  for (let i = 0; i < n; i++) {
    const char = input[i];
    const matchingLhs = terminalRules.get(char);
    const addedSymbols: string[] = [];

    if (matchingLhs) {
      for (const lhs of matchingLhs) {
        table[i][i].nonTerminals.push(lhs);
        table[i][i].derivations.push({
          lhs,
          rule: `${lhs} -> ${char}`,
        });
        addedSymbols.push(lhs);
      }
    }

    steps.push({
      stepIndex: stepCounter++,
      type: 'init',
      cell: [i, i],
      substring: char,
      length: 1,
      matched: addedSymbols.length > 0,
      addedSymbol: addedSymbols.join(', '),
      explanation:
        addedSymbols.length > 0
          ? `Initialization: Terminal '${char}' at index ${i} matches production(s): ${addedSymbols
              .map((s) => `${s} -> ${char}`)
              .join(', ')}. Set T[${i}][${i}] = {${table[i][i].nonTerminals.join(', ')}}.`
          : `Initialization: Terminal '${char}' at index ${i} has no matching terminal rules in the grammar. T[${i}][${i}] = ∅.`,
    });
  }

  // STEP 2: Inductive Case - Substring length l = 2 to n
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      const sub = input.slice(i, j + 1);
      const cellSet = new Set<string>();

      // Try every split point k from i to j - 1
      for (let k = i; k < j; k++) {
        const leftSymbols = table[i][k].nonTerminals;
        const rightSymbols = table[k + 1][j].nonTerminals;
        const leftSub = input.slice(i, k + 1);
        const rightSub = input.slice(k + 1, j + 1);

        const foundAnyForSplit: string[] = [];

        // Check cross-product of left and right symbols
        for (const B of leftSymbols) {
          for (const C of rightSymbols) {
            const pair = `${B}${C}`;
            const producingA = binaryRules.get(pair);

            if (producingA) {
              for (const A of producingA) {
                if (!cellSet.has(A)) {
                  cellSet.add(A);
                  table[i][j].nonTerminals.push(A);
                }
                // Record derivation backpointer
                table[i][j].derivations.push({
                  lhs: A,
                  rule: `${A} -> ${B}${C}`,
                  splitK: k,
                  leftSymbol: B,
                  rightSymbol: C,
                });
                foundAnyForSplit.push(`${A} -> ${B}${C}`);
              }
            }
          }
        }

        // Add step record for significant / explanatory splits
        // If match found or small input, record split step
        if (foundAnyForSplit.length > 0 || n <= 6) {
          steps.push({
            stepIndex: stepCounter++,
            type: 'check_split',
            cell: [i, j],
            substring: sub,
            length: len,
            splitK: k,
            leftCell: [i, k],
            rightCell: [k + 1, j],
            leftSymbols: [...leftSymbols],
            rightSymbols: [...rightSymbols],
            matched: foundAnyForSplit.length > 0,
            checkingRule: foundAnyForSplit.join('; '),
            explanation:
              foundAnyForSplit.length > 0
                ? `Split k=${k} ("${leftSub}" | "${rightSub}"): Left cell T[${i}][${k}] has {${leftSymbols.join(
                    ', '
                  )}}, right cell T[${k + 1}][${j}] has {${rightSymbols.join(
                    ', '
                  )}}. Matched rule(s): ${foundAnyForSplit.join(', ')}. Added to T[${i}][${j}].`
                : `Split k=${k} ("${leftSub}" | "${rightSub}"): No production A -> BC matches combinations of T[${i}][${k}] × T[${
                    k + 1
                  }][${j}].`,
          });
        }
      }

      // Summary step for cell completion
      steps.push({
        stepIndex: stepCounter++,
        type: 'cell_complete',
        cell: [i, j],
        substring: sub,
        length: len,
        matched: table[i][j].nonTerminals.length > 0,
        explanation:
          table[i][j].nonTerminals.length > 0
            ? `Cell T[${i}][${j}] for substring "${sub}" (length ${len}) completed: {${table[i][
                j
              ].nonTerminals.join(', ')}}`
            : `Cell T[${i}][${j}] for substring "${sub}" (length ${len}) is empty ∅.`,
      });
    }
  }

  // STEP 3: Final Acceptance Check
  const rootCell = table[0][n - 1];
  const accepted = rootCell.nonTerminals.includes(startSymbol);

  // Reconstruct parse tree if accepted
  let parseTree: ParseTreeNode | null = null;
  if (accepted) {
    parseTree = buildParseTree(table, input, startSymbol, 0, n - 1);
  }

  const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    accepted,
    input,
    startSymbol,
    length: n,
    table,
    steps,
    executionTimeMs,
    grammarSize: totalRules,
    nonTerminalsCount: Object.keys(grammar).length,
    rootNonTerminals: [...rootCell.nonTerminals],
    parseTree,
  };
}

/**
 * Reconstructs a valid parse tree from CYK backpointer derivations.
 */
function buildParseTree(
  table: CYKCell[][],
  input: string,
  symbol: string,
  i: number,
  j: number
): ParseTreeNode | null {
  if (i === j) {
    return {
      symbol,
      substring: input[i],
      range: [i, j],
      terminal: input[i],
    };
  }

  // Find a derivation that produced this symbol in cell (i, j)
  const cell = table[i][j];
  const derivation = cell.derivations.find((d) => d.lhs === symbol && d.splitK !== undefined);

  if (!derivation || derivation.splitK === undefined || !derivation.leftSymbol || !derivation.rightSymbol) {
    return {
      symbol,
      substring: input.slice(i, j + 1),
      range: [i, j],
    };
  }

  const k = derivation.splitK;
  const leftChild = buildParseTree(table, input, derivation.leftSymbol, i, k);
  const rightChild = buildParseTree(table, input, derivation.rightSymbol, k + 1, j);

  return {
    symbol,
    substring: input.slice(i, j + 1),
    range: [i, j],
    left: leftChild || undefined,
    right: rightChild || undefined,
  };
}

/**
 * Generates a random valid CNF grammar and input string.
 */
export function generateRandomExample(): {
  grammarText: string;
  startSymbol: string;
  input: string;
  description: string;
} {
  const nonTerminals = ['S', 'A', 'B', 'C'];
  const terminals = ['a', 'b'];

  const grammar: CNFGrammar = {
    S: [],
    A: [],
    B: [],
    C: [],
  };

  // Ensure each non-terminal has at least one terminal rule
  grammar.S.push('AB');
  grammar.A.push('a');
  grammar.B.push('b');
  grammar.C.push(Math.random() > 0.5 ? 'a' : 'b');

  // Add random binary rules
  const pairs = ['AB', 'BC', 'BA', 'CA', 'CB', 'CC', 'AA', 'BB'];
  // Shuffle pairs
  pairs.sort(() => Math.random() - 0.5);

  grammar.S.push(pairs[0]);
  grammar.A.push(pairs[1]);
  grammar.B.push(pairs[2]);
  grammar.C.push(pairs[3]);

  if (Math.random() > 0.4) {
    grammar.S.push('a');
  }

  // Generate a random input of length 3 to 5 using the terminals
  const length = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
  let input = '';
  for (let i = 0; i < length; i++) {
    input += terminals[Math.floor(Math.random() * terminals.length)];
  }

  const grammarText = formatGrammarText(grammar);
  return {
    grammarText,
    startSymbol: 'S',
    input,
    description: `Randomly generated CNF grammar with terminals {a, b} and input "${input}".`,
  };
}

/**
 * Standard Library of Real CNF Grammars for CS Theory students.
 */
export const EXAMPLE_LIBRARY: ExampleCase[] = [
  {
    id: 'default-classic',
    title: 'Default Hopcroft & Ullman Classic',
    category: 'Basic',
    description: 'The standard textbook CYK demonstration grammar from Introduction to Automata Theory, Languages, and Computation.',
    grammarText: `S -> AB | BC
A -> BA | a
B -> CC | b
C -> AB | a`,
    startSymbol: 'S',
    input: 'baaba',
  },
  {
    id: 'simple-accepted',
    title: 'Simple Palindromic Structure (Accepted)',
    category: 'Accepted',
    description: 'Generates balanced strings over {a, b} with center transition.',
    grammarText: `S -> AB | CD | SS
A -> a
B -> b
C -> a
D -> b`,
    startSymbol: 'S',
    input: 'ab',
  },
  {
    id: 'simple-rejected',
    title: 'Mismatched Bracket Pattern (Rejected)',
    category: 'Rejected',
    description: 'Grammar produces matching pairs; test input violates the production structure and is cleanly rejected.',
    grammarText: `S -> AB | BC
A -> BA | a
B -> CC | b
C -> AB | a`,
    startSymbol: 'S',
    input: 'bbbbb',
  },
  {
    id: 'binary-arithmetic',
    title: 'Arithmetic Expressions in CNF',
    category: 'Educational',
    description: 'Models simplified expressions with operands (x) and operators (+, *) transformed into CNF.',
    grammarText: `S -> ET | x
E -> x
T -> OP
O -> +
P -> x`,
    startSymbol: 'S',
    input: 'x+x',
  },
  {
    id: 'ambiguous-grammar',
    title: 'Ambiguous Grammar Multi-Derivation',
    category: 'Ambiguous',
    description: 'Demonstrates ambiguity where multiple distinct derivations exist for the same input string.',
    grammarText: `S -> SS | a
A -> a`,
    startSymbol: 'S',
    input: 'aaa',
  },
  {
    id: 'longer-string',
    title: 'Longer Input (Length 7)',
    category: 'Longer Input',
    description: 'Tests higher dynamic programming triangular table layers and multiple splits.',
    grammarText: `S -> AB | BC
A -> BA | a
B -> CC | b
C -> AB | a`,
    startSymbol: 'S',
    input: 'baabaab',
  },
  {
    id: 'nlp-syntax',
    title: 'Natural Language Processing (Noun/Verb Phrase)',
    category: 'Educational',
    description: 'Chomsky Normal Form representation of simple English syntax: S -> NP VP.',
    grammarText: `S -> NV
N -> DT NN
V -> VB NP
D -> the
M -> cat
B -> chased
P -> fish`,
    startSymbol: 'S',
    input: 'the',
  },
  {
    id: 'even-as',
    title: 'Even Count of Terminals',
    category: 'Multiple Productions',
    description: 'Generates strings with even parity using symmetric CNF substitutions.',
    grammarText: `S -> AA | BB
A -> a
B -> b`,
    startSymbol: 'S',
    input: 'aa',
  },
  {
    id: 'nested-dyck',
    title: 'Dyck Language (Parentheses CNF)',
    category: 'Educational',
    description: 'Parentheses matching language encoded into CNF with terminals ( and ).',
    grammarText: `S -> LR | SS
L -> (
R -> )`,
    startSymbol: 'S',
    input: '()()',
  },
  {
    id: 'dense-derivation',
    title: 'Dense Production Matrix',
    category: 'Multiple Productions',
    description: 'Rich interconnection between non-terminals allowing comprehensive tracing of table calculations.',
    grammarText: `S -> AB | BA | a
A -> BA | a | b
B -> AB | b | a`,
    startSymbol: 'S',
    input: 'aba',
  },
];
