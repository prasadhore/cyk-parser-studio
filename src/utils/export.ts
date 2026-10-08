import { CYKResult, ValidationResult } from '../types/cyk.ts';

export function exportJSON(result: CYKResult, grammarText: string) {
  const data = {
    app: 'CYK Parser Studio',
    version: '1.0.0',
    date: new Date().toISOString(),
    input: result.input,
    startSymbol: result.startSymbol,
    accepted: result.accepted,
    grammar: grammarText,
    executionTimeMs: result.executionTimeMs,
    grammarSize: result.grammarSize,
    nonTerminalsCount: result.nonTerminalsCount,
    table: result.table,
    steps: result.steps,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cyk-result-${result.input || 'empty'}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(result: CYKResult) {
  const n = result.length;
  const rows: string[] = [];

  // Header row: Columns represent end index j
  rows.push(['i \\ j', ...Array.from({ length: n }, (_, j) => `j=${j}`)].join(','));

  for (let i = 0; i < n; i++) {
    const row = [`i=${i}`];
    for (let j = 0; j < n; j++) {
      if (j < i) {
        row.push('""');
      } else {
        const cell = result.table[i][j];
        const content = cell.nonTerminals.length > 0 ? cell.nonTerminals.join(' ') : '∅';
        row.push(`"${content} (${cell.substring})"`);
      }
    }
    rows.push(row.join(','));
  }

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cyk-table-${result.input}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateShareURL(grammarText: string, startSymbol: string, input: string): string {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('g', encodeURIComponent(grammarText));
  url.searchParams.set('s', encodeURIComponent(startSymbol));
  url.searchParams.set('w', encodeURIComponent(input));
  return url.toString();
}

export function parseShareURL(): { grammarText?: string; startSymbol?: string; input?: string } | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const g = params.get('g');
  const s = params.get('s');
  const w = params.get('w');

  if (g || w) {
    return {
      grammarText: g ? decodeURIComponent(g) : undefined,
      startSymbol: s ? decodeURIComponent(s) : undefined,
      input: w ? decodeURIComponent(w) : undefined,
    };
  }
  return null;
}

export function generateStandaloneReportHTML(
  result: CYKResult,
  grammarText: string,
  validation?: ValidationResult
): string {
  const n = result.length;
  const dateStr = new Date().toLocaleString();

  let tableRows = '';
  // Render triangular table rows
  for (let len = n; len >= 1; len--) {
    let cellsHtml = '';
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      const cell = result.table[i][j];
      const nts = cell.nonTerminals.length > 0 ? cell.nonTerminals.join(', ') : '∅';
      const isRoot = len === n;
      cellsHtml += `
        <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; background: ${
          isRoot ? (result.accepted ? '#ecfdf5' : '#fef2f2') : '#f8fafc'
        }; border-radius: 6px;">
          <div style="font-size: 11px; color: #64748b; font-family: monospace;">[${i}, ${j}] "${cell.substring}"</div>
          <div style="font-size: 14px; font-weight: bold; color: ${
            cell.nonTerminals.length > 0 ? '#0f172a' : '#94a3b8'
          }; margin-top: 4px;">{${nts}}</div>
        </td>
      `;
    }
    tableRows += `<tr><th style="padding: 8px; color: #64748b; text-align: right; width: 60px;">Len ${len}</th>${cellsHtml}</tr>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CYK Algorithm Report - ${result.input}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #0f172a; margin: 40px auto; max-width: 900px; padding: 0 20px; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .subtitle { color: #64748b; margin-bottom: 24px; font-size: 14px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; }
    .accepted { background: #dcfce7; color: #15803d; }
    .rejected { background: #fee2e2; color: #b91c1c; }
    table { width: 100%; border-collapse: separate; border-spacing: 6px; margin-top: 12px; }
    pre { background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 13px; font-family: monospace; overflow-x: auto; }
    .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 12px; }
    .meta-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; }
    .meta-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
    .meta-value { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 2px; }
    @media print { body { margin: 20px; } .card { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>CYK Parser Studio Report</h1>
  <div class="subtitle">Cocke–Younger–Kasami Dynamic Programming Analysis · Generated ${dateStr}</div>

  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 12px; color: #64748b;">PARSE RESULT</div>
        <div style="font-size: 20px; font-weight: bold; margin-top: 4px;">
          Input String: <code style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">${result.input}</code>
        </div>
      </div>
      <div>
        <span class="status-badge ${result.accepted ? 'accepted' : 'rejected'}">
          ${result.accepted ? '✓ STRING ACCEPTED' : '✕ STRING REJECTED'}
        </span>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <div class="meta-label">Start Symbol</div>
        <div class="meta-value">${result.startSymbol}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Execution Time</div>
        <div class="meta-value">${result.executionTimeMs} ms</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Root Cell Non-Terminals</div>
        <div class="meta-value">{${result.rootNonTerminals.join(', ') || '∅'}}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <h3 style="margin-top: 0;">Chomsky Normal Form (CNF) Grammar</h3>
    <pre>${grammarText}</pre>
  </div>

  <div class="card">
    <h3 style="margin-top: 0;">CYK Triangular Dynamic Programming Table</h3>
    <p style="font-size: 13px; color: #64748b; margin-top: 0;">Each cell [i, j] displays non-terminals deriving substring w[i..j].</p>
    <table>
      ${tableRows}
    </table>
  </div>

  <div class="card">
    <h3 style="margin-top: 0;">Theoretical Complexity</h3>
    <p style="font-size: 13px; color: #334155;">
      <strong>Time Complexity:</strong> O(n³ · |G|) where n = ${n} and |G| = ${result.grammarSize} productions.<br>
      <strong>Space Complexity:</strong> O(n² · |N|) where |N| = ${result.nonTerminalsCount} non-terminals.
    </p>
  </div>
</body>
</html>`;
}
