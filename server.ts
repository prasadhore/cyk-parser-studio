import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import {
  parseGrammarText,
  validateCNF,
  runCYK,
  EXAMPLE_LIBRARY,
} from './src/algorithms/cyk.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '2mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'CYK Parser Studio API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Examples Library
app.get('/api/examples', (_req: Request, res: Response) => {
  res.json({
    count: EXAMPLE_LIBRARY.length,
    examples: EXAMPLE_LIBRARY,
  });
});

// Validate Grammar CNF
app.post('/api/cyk/validate', (req: Request, res: Response) => {
  try {
    const { grammar, grammarText, startSymbol = 'S' } = req.body;

    let targetGrammar = grammar;
    let targetStartSymbol = startSymbol;

    if (grammarText && typeof grammarText === 'string') {
      const parsed = parseGrammarText(grammarText);
      targetGrammar = parsed.grammar;
      if (!req.body.startSymbol) {
        targetStartSymbol = parsed.startSymbol;
      }
    }

    if (!targetGrammar || typeof targetGrammar !== 'object') {
      return res.status(400).json({
        error: 'Invalid request: grammar object or grammarText string required.',
      });
    }

    const result = validateCNF(targetGrammar, targetStartSymbol);
    return res.json({
      valid: result.valid,
      startSymbol: targetStartSymbol,
      errors: result.errors,
      normalizedGrammar: result.normalizedGrammar,
      nonTerminals: result.nonTerminals,
      terminals: result.terminals,
      totalProductions: result.totalProductions,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Error validating grammar',
      message: err?.message || 'Unknown error',
    });
  }
});

// Run CYK Algorithm
app.post('/api/cyk/parse', (req: Request, res: Response) => {
  try {
    const { grammar, grammarText, startSymbol = 'S', input } = req.body;

    if (input === undefined || typeof input !== 'string') {
      return res.status(400).json({
        error: 'Invalid request: "input" must be a string.',
      });
    }

    if (input.length > 25) {
      return res.status(400).json({
        error: 'Input string exceeds safety limit of 25 characters for interactive demonstration.',
      });
    }

    let targetGrammar = grammar;
    let targetStartSymbol = startSymbol;

    if (grammarText && typeof grammarText === 'string') {
      const parsed = parseGrammarText(grammarText);
      targetGrammar = parsed.grammar;
      if (!req.body.startSymbol) {
        targetStartSymbol = parsed.startSymbol;
      }
    }

    if (!targetGrammar || typeof targetGrammar !== 'object') {
      return res.status(400).json({
        error: 'Invalid request: grammar object or grammarText string required.',
      });
    }

    // Validate CNF first
    const validation = validateCNF(targetGrammar, targetStartSymbol);
    if (!validation.valid) {
      return res.status(422).json({
        error: 'Grammar is not in valid Chomsky Normal Form (CNF)',
        validationErrors: validation.errors,
      });
    }

    // Run the actual CYK algorithm
    const result = runCYK(targetGrammar, targetStartSymbol, input);

    return res.json({
      accepted: result.accepted,
      input: result.input,
      startSymbol: result.startSymbol,
      length: result.length,
      table: result.table,
      steps: result.steps,
      executionTimeMs: result.executionTimeMs,
      grammarSize: result.grammarSize,
      nonTerminalsCount: result.nonTerminalsCount,
      rootNonTerminals: result.rootNonTerminals,
      parseTree: result.parseTree,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Algorithm execution error',
      message: err?.message || 'Unknown error',
    });
  }
});

// API Documentation Endpoint
app.get('/api/docs', (_req: Request, res: Response) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'CYK Parser Studio REST API',
      version: '1.0.0',
      description: 'Production API for Chomsky Normal Form validation and Cocke–Younger–Kasami dynamic programming parsing.',
    },
    paths: {
      '/api/health': {
        get: {
          summary: 'Health and status check',
          responses: { 200: { description: 'Service is active' } },
        },
      },
      '/api/examples': {
        get: {
          summary: 'Retrieve 10+ standard CNF textbook examples',
          responses: { 200: { description: 'Array of categorized test cases' } },
        },
      },
      '/api/cyk/validate': {
        post: {
          summary: 'Validate grammar compliance with Chomsky Normal Form',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    grammarText: { type: 'string', example: 'S -> AB | a\nA -> a\nB -> b' },
                    startSymbol: { type: 'string', example: 'S' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Validation diagnostics' } },
        },
      },
      '/api/cyk/parse': {
        post: {
          summary: 'Execute CYK algorithm and return triangular table & derivation steps',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['grammarText', 'input'],
                  properties: {
                    grammarText: { type: 'string', example: 'S -> AB | BC\nA -> BA | a\nB -> CC | b\nC -> AB | a' },
                    startSymbol: { type: 'string', example: 'S' },
                    input: { type: 'string', example: 'baaba' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Parsing result, triangular matrix, steps, and parse tree' },
            422: { description: 'CNF grammar validation failed' },
          },
        },
      },
      '/api/download/package': {
        get: {
          summary: 'Download standalone backend & CLI package as ZIP',
          responses: { 200: { description: 'application/zip archive' } },
        },
      },
    },
  });
});

// Download Standalone Backend API ZIP
app.get('/api/download/package', async (_req: Request, res: Response) => {
  try {
    const zip = new JSZip();

    // package.json for standalone backend
    const pkgJson = JSON.stringify(
      {
        name: 'cyk-parser-studio-api',
        version: '1.0.0',
        description: 'Standalone Cocke-Younger-Kasami (CYK) Parsing Algorithm Server',
        main: 'server.js',
        scripts: {
          start: 'node server.js',
          dev: 'tsx server.ts',
          test: 'tsx test.ts',
        },
        dependencies: {
          express: '^4.21.2',
        },
        devDependencies: {
          '@types/express': '^4.17.21',
          '@types/node': '^22.14.0',
          tsx: '^4.21.0',
          typescript: '^7.0.2',
        },
      },
      null,
      2
    );

    const readmeContent = `# CYK Parser Studio - Standalone API Server

Cocke–Younger–Kasami Dynamic Programming Table Algorithm Server in TypeScript / Node.js.

## Requirements
- Node.js >= 18
- npm or yarn

## Setup
\`\`\`bash
npm install
npm run dev
\`\`\`

## Test API
\`\`\`bash
curl -X POST http://localhost:3000/api/cyk/parse \\
  -H "Content-Type: application/json" \\
  -d '{"grammarText": "S -> AB | BC\\nA -> BA | a\\nB -> CC | b\\nC -> AB | a", "startSymbol": "S", "input": "baaba"}'
\`\`\`

## Endpoints
- POST \`/api/cyk/parse\` - Run dynamic programming CYK table algorithm
- POST \`/api/cyk/validate\` - Verify Chomsky Normal Form (CNF)
- GET \`/api/examples\` - Preloaded CS Theory examples
- GET \`/api/docs\` - OpenAPI specs
`;

    const serverCode = `import express from 'express';

const app = express();
app.use(express.json());

// Pure CYK Implementation
function parseGrammar(text) {
  const grammar = {};
  let start = 'S';
  const lines = text.split('\\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [lhsRaw, rhsRaw] = trimmed.split(/->|→/);
    if (!lhsRaw || !rhsRaw) continue;
    const lhs = lhsRaw.trim();
    if (!grammar[lhs]) grammar[lhs] = [];
    for (const alt of rhsRaw.split('|').map(s => s.trim()).filter(Boolean)) {
      if (!grammar[lhs].includes(alt)) grammar[lhs].push(alt);
    }
    if (!start) start = lhs;
  }
  return { grammar, startSymbol: start };
}

function runCYK(grammar, startSymbol, input) {
  const n = input.length;
  const table = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => [])
  );

  // Length 1 (Init)
  for (let i = 0; i < n; i++) {
    const ch = input[i];
    for (const [lhs, rhss] of Object.entries(grammar)) {
      if (rhss.includes(ch)) {
        table[i][i].push(lhs);
      }
    }
  }

  // Length 2 to n
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      const set = new Set();
      for (let k = i; k < j; k++) {
        for (const B of table[i][k]) {
          for (const C of table[k + 1][j]) {
            const pair = B + C;
            for (const [lhs, rhss] of Object.entries(grammar)) {
              if (rhss.includes(pair) && !set.has(lhs)) {
                set.add(lhs);
                table[i][j].push(lhs);
              }
            }
          }
        }
      }
    }
  }

  const accepted = table[0][n - 1].includes(startSymbol);
  return { accepted, table, input, startSymbol };
}

app.post('/api/cyk/parse', (req, res) => {
  const { grammarText, input, startSymbol = 'S' } = req.body;
  const { grammar, startSymbol: parsedStart } = parseGrammar(grammarText);
  const result = runCYK(grammar, startSymbol || parsedStart, input);
  res.json(result);
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(3000, () => {
  console.log('CYK Server running on http://localhost:3000');
});
`;

    zip.file('package.json', pkgJson);
    zip.file('README.md', readmeContent);
    zip.file('server.js', serverCode);

    const content = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="cyk-parser-studio-api.zip"');
    res.send(content);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate download package', details: err?.message });
  }
});

// Setup Vite middleware in development or static serving in production
async function startServer() {
  if (!isProduction) {
    const vite = await (
      await import('vite')
    ).createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CYK Parser Studio] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
