# CYK Parser Studio

> **Interactive Cocke–Younger–Kasami Parser & Visualization Tool**  
> *Parse. Visualize. Understand.*

[![CI Test & Build](https://github.com/example/cyk-parser-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/example/cyk-parser-studio/actions)
[![Build Windows Application](https://github.com/example/cyk-parser-studio/actions/workflows/windows.yml/badge.svg)](https://github.com/example/cyk-parser-studio/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

CYK Parser Studio is a full-stack, production-grade educational laboratory and developer tool for the **Cocke–Younger–Kasami (CYK)** dynamic programming parsing algorithm. It accepts context-free grammars in **Chomsky Normal Form (CNF)** and input strings, computes the complete dynamic programming triangular matrix, and renders an interactive step-by-step trace with backpointers, split animations, syntax parse trees, audio cues, and academic print reports.

---

## Table of Contents
1. [Core Features](#core-features)
2. [CYK Algorithm Overview](#cyk-algorithm-overview)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Getting Started Locally](#getting-started-locally)
6. [Running Tests](#running-tests)
7. [REST API Endpoints](#rest-api-endpoints)
8. [Windows Desktop App & GitHub Actions](#windows-desktop-app--github-actions)
9. [Deployment](#deployment)
10. [License](#license)

---

## 1. Core Features

- **Authentic Dynamic Programming Engine**: Pure TypeScript implementation of the real CYK algorithm ($O(n^3 \cdot |G|)$ time complexity, $O(n^2 \cdot |N|)$ space complexity). No hardcoded mock results.
- **Strict Chomsky Normal Form (CNF) Validator**: Enforces rules $A \to BC$ (binary non-terminals) and $A \to a$ (single terminal). Provides pinpoint error diagnoses and remediation hints.
- **Interactive Triangular DP Matrix**:
  - **Pyramid View**: Classic inverted pyramid from root apex ($len = n$) down to terminal base ($len = 1$).
  - **Matrix Grid View**: Upper-triangular matrix coordinate display ($T[i][j]$).
- **Cell Derivation Inspection Modal**: Click any cell to view all tested split points $k$, left and right subproblem sets ($T[i][k] \times T[k+1][j]$), matching production rules, and an interactive split flow diagram.
- **Step-by-Step Playback Controller**: First, Previous, Next, Auto-Play, Pause, and Speed Control (0.5x, 1x, 2x, 3x) with real-time text explanations for every subproblem evaluation.
- **Derivation Parse Tree Generator**: Reconstructs hierarchical syntax trees by recursively tracing backpointer derivations from the root cell $T[0][n-1]$.
- **Professional Answer Popup**: Modal displaying ACCEPTED / REJECTED status, execution time in milliseconds, grammar metrics, and celebratory confetti.
- **Academic Print & PDF Layout**: Clean, print-specific stylesheet (`@media print`) generating formatted examination/homework reports.
- **Export & Share**:
  - Export full algorithm trace to JSON
  - Export DP matrix to CSV
  - Export standalone HTML report
  - Share state via query parameters (`?g=...&w=...&s=...`)
- **Built-in Web Audio Synthesizer**: Harmonic chimes, clicks, success chords, and error tones without external audio dependencies.
- **10+ Curated Textbook Examples**: Hopcroft-Ullman classic, balanced brackets, ambiguous grammars, NLP syntax, Dyck language, arithmetic CNF, and random valid grammar generator.
- **Windows Desktop Application**: Fully configured Electron wrapper and GitHub Actions automated Windows `.exe` installer builder.

---

## 2. CYK Algorithm Overview

### Chomsky Normal Form (CNF)
A Context-Free Grammar $G = (V, \Sigma, R, S)$ is in Chomsky Normal Form if all rules are of the form:
- $A \to BC$ where $A, B, C \in V$
- $A \to a$ where $A \in V$ and $a \in \Sigma$

### Dynamic Programming Recurrence
For an input string $w = w_1 w_2 \dots w_n$:

1. **Base Case ($len = 1$):**
   $$T[i][i] = \{ A \in V \mid A \to w_i \in R \}$$

2. **Inductive Step ($len = 2 \dots n$):**
   For $j = i + len - 1$ and all splits $k \in [i, j-1]$:
   $$T[i][j] = \bigcup_{k=i}^{j-1} \{ A \in V \mid A \to BC \in R, B \in T[i][k], C \in T[k+1][j] \}$$

3. **Acceptance Condition:**
   $$w \in L(G) \iff S \in T[0][n-1]$$

---

## 3. Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Web Audio API.
- **Backend**: Node.js, Express, TypeScript (`server.ts`).
- **Desktop**: Electron offline runner (`desktop/main.cjs`) packaged with `electron-builder`.
- **CI/CD**: GitHub Actions workflow (`.github/workflows/windows.yml`) for automated Windows release builds.

---

## 4. Project Structure

```
cyk-parser-studio/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated test & build workflow
│       └── windows.yml            # Windows .exe installer workflow
├── desktop/
│   └── main.cjs                   # Electron desktop application entry
├── src/
│   ├── algorithms/
│   │   └── cyk.ts                 # Real CYK algorithm, CNF validator & library
│   ├── components/
│   │   ├── AlgorithmFlow.tsx      # Stage progression pipeline visualizer
│   │   ├── AnswerPopup.tsx        # Result modal with confetti & exports
│   │   ├── CellModal.tsx          # Cell split details & derivation diagrams
│   │   ├── CYKTable.tsx           # Pyramid & Matrix triangular tables
│   │   ├── GrammarEditor.tsx      # CNF editor with line numbers & live validation
│   │   ├── Header.tsx             # Navigation, theme toggle, audio controls
│   │   ├── ParseTreeViewer.tsx    # Reconstructed syntax parse tree
│   │   ├── PrintReport.tsx        # Academic print layout
│   │   └── StepController.tsx     # Algorithm animation playback deck
│   ├── pages/
│   │   ├── ApiDocsPage.tsx        # REST API interactive documentation
│   │   ├── DownloadsPage.tsx      # Multi-platform downloads center
│   │   ├── ExamplesPage.tsx       # 10+ categorized textbook test cases
│   │   ├── LandingPage.tsx        # Educational hero & feature showcase
│   │   └── LearnPage.tsx          # Complete CS Theory guide
│   ├── test/
│   │   └── cyk.test.ts            # Test suite for parsing, edge cases & CNF
│   ├── types/
│   │   └── cyk.ts                 # TypeScript type definitions
│   ├── utils/
│   │   ├── export.ts              # JSON/CSV/HTML/URL share exporters
│   │   └── sound.ts               # Web Audio API synthesizer
│   ├── App.tsx                    # Main state machine & workspace
│   ├── index.css                  # Tailwind styles & print media rules
│   └── main.tsx                   # React root entry
├── server.ts                      # Full-stack Express REST API server
├── index.html                     # HTML entry point with metadata
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript compiler settings
└── vite.config.ts                 # Vite build configuration
```

---

## 5. Getting Started Locally

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/cyk-parser-studio.git
cd cyk-parser-studio

# Install dependencies
npm install

# Start full-stack development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 6. Running Tests

Execute the unit test suite covering Hopcroft-Ullman classic grammar, rejected inputs, unit productions, ternary rules, ambiguous grammars, and single-character inputs:

```bash
npm test
```

---

## 7. REST API Endpoints

The server exposes a REST API at `/api`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service status, uptime, and timestamp |
| `GET` | `/api/examples` | Curated library of 10+ textbook CNF test cases |
| `POST` | `/api/cyk/validate` | Validates grammar against Chomsky Normal Form |
| `POST` | `/api/cyk/parse` | Executes CYK and returns table, steps, and membership |
| `GET` | `/api/docs` | OpenAPI 3.0 specification |
| `GET` | `/api/download/package` | Downloads standalone backend package as ZIP |

### Example Request
```bash
curl -X POST http://localhost:3000/api/cyk/parse \
  -H "Content-Type: application/json" \
  -d '{
    "grammarText": "S -> AB | BC\nA -> BA | a\nB -> CC | b\nC -> AB | a",
    "startSymbol": "S",
    "input": "baaba"
  }'
```

---

## 8. Windows Desktop App & GitHub Actions

### Packaging Locally
```bash
npm run build
npx electron-builder --windows --x64
```
Outputs installer: `release/CYK-Parser-Studio-Setup.exe`.

### Automated GitHub Actions Workflow
The workflow `.github/workflows/windows.yml` runs on `windows-latest` on every release tag or manual dispatch (`workflow_dispatch`), packages the application, and uploads the `.exe` artifact to GitHub Actions releases.

---

## 9. Deployment

- **Frontend on Vercel / Netlify**: Run `npm run build` with output directory `dist`.
- **Full-stack on Render / Railway**: Set start command `npm start` (runs `server.ts` via Express on port 3000).

---

## 10. License

MIT License. Designed and engineered for academic use in Theory of Computation and Formal Languages courses.
