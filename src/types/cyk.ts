export interface CNFGrammar {
  [nonTerminal: string]: string[];
}

export interface Production {
  lhs: string;
  rhs: string;
  isTerminal: boolean;
}

export interface ValidationError {
  production?: string;
  problem: string;
  suggestion: string;
  line?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  normalizedGrammar: CNFGrammar;
  nonTerminals: string[];
  terminals: string[];
  totalProductions: number;
}

export interface Derivation {
  lhs: string;
  rule: string;
  splitK?: number;
  leftSymbol?: string;
  rightSymbol?: string;
}

export interface CYKCell {
  i: number;
  j: number;
  length: number;
  substring: string;
  nonTerminals: string[];
  derivations: Derivation[];
}

export interface CYKStep {
  stepIndex: number;
  type: 'init' | 'check_split' | 'cell_complete';
  cell: [number, number]; // [i, j]
  substring: string;
  length: number;
  splitK?: number;
  leftCell?: [number, number];
  rightCell?: [number, number];
  leftSymbols?: string[];
  rightSymbols?: string[];
  checkingRule?: string;
  addedSymbol?: string;
  matched: boolean;
  explanation: string;
}

export interface ParseTreeNode {
  symbol: string;
  substring: string;
  range: [number, number];
  left?: ParseTreeNode;
  right?: ParseTreeNode;
  terminal?: string;
}

export interface CYKResult {
  accepted: boolean;
  input: string;
  startSymbol: string;
  length: number;
  table: CYKCell[][];
  steps: CYKStep[];
  executionTimeMs: number;
  grammarSize: number;
  nonTerminalsCount: number;
  rootNonTerminals: string[];
  parseTree?: ParseTreeNode | null;
}

export interface ExampleCase {
  id: string;
  title: string;
  category: 'Basic' | 'Accepted' | 'Rejected' | 'Ambiguous' | 'Longer Input' | 'Multiple Productions' | 'Educational';
  description: string;
  grammarText: string;
  startSymbol: string;
  input: string;
}
