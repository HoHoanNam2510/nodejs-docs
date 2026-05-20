const KEYWORDS = new Set([
  'abstract',
  'as',
  'async',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'declare',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'from',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'keyof',
  'let',
  'module',
  'namespace',
  'new',
  'null',
  'of',
  'override',
  'private',
  'protected',
  'public',
  'readonly',
  'require',
  'return',
  'satisfies',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'type',
  'typeof',
  'undefined',
  'var',
  'while',
  'yield',
]);

const BUILTIN_TYPES = new Set([
  'any',
  'boolean',
  'never',
  'number',
  'object',
  'string',
  'symbol',
  'unknown',
  'void',
  'Array',
  'ArrayBuffer',
  'Awaited',
  'BigInt',
  'Boolean',
  'Buffer',
  'ConstructorParameters',
  'Date',
  'Error',
  'EventEmitter',
  'Exclude',
  'Extract',
  'Function',
  'InstanceType',
  'Map',
  'NextFunction',
  'NonNullable',
  'Number',
  'Object',
  'Omit',
  'Parameters',
  'Partial',
  'Pick',
  'Promise',
  'Readonly',
  'Record',
  'RegExp',
  'Request',
  'Required',
  'Response',
  'ReturnType',
  'Set',
  'String',
  'Symbol',
  'WeakMap',
  'WeakSet',
]);

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function span(cls: string, s: string): string {
  return `<span class="${cls}">${esc(s)}</span>`;
}

export function highlight(code: string): string {
  let out = '';
  let i = 0;
  const n = code.length;
  let lastDot = false;

  while (i < n) {
    const ch = code[i];

    // ── Template literal ──────────────────────────────────────────────────────
    if (ch === '`') {
      let j = i + 1;
      let raw = '`';
      while (j < n) {
        if (code[j] === '\\') {
          raw += code[j] + (code[j + 1] ?? '');
          j += 2;
          continue;
        }
        if (code[j] === '`') {
          raw += '`';
          j++;
          break;
        }
        raw += code[j++];
      }
      out += span('str', raw);
      i = j;
      lastDot = false;
      continue;
    }

    // ── String literal "..." or '...' ─────────────────────────────────────────
    if (ch === '"' || ch === "'") {
      const q = ch;
      let j = i + 1;
      let raw = q;
      while (j < n) {
        if (code[j] === '\\') {
          raw += code[j] + (code[j + 1] ?? '');
          j += 2;
          continue;
        }
        if (code[j] === q || code[j] === '\n') {
          if (code[j] === q) {
            raw += q;
            j++;
          }
          break;
        }
        raw += code[j++];
      }
      out += span('str', raw);
      i = j;
      lastDot = false;
      continue;
    }

    // ── Line comment // ───────────────────────────────────────────────────────
    if (ch === '/' && code[i + 1] === '/') {
      let j = i;
      while (j < n && code[j] !== '\n') j++;
      out += span('cm', code.slice(i, j));
      i = j;
      lastDot = false;
      continue;
    }

    // ── Block comment /* ... */ ───────────────────────────────────────────────
    if (ch === '/' && code[i + 1] === '*') {
      let j = i + 2;
      while (j < n - 1 && !(code[j] === '*' && code[j + 1] === '/')) j++;
      j += 2;
      out += span('cm', code.slice(i, j));
      i = j;
      lastDot = false;
      continue;
    }

    // ── Number ────────────────────────────────────────────────────────────────
    if (/\d/.test(ch) || (ch === '.' && i + 1 < n && /\d/.test(code[i + 1]))) {
      let j = i;
      if (ch === '0' && i + 1 < n && /[xXbBoO]/.test(code[i + 1])) {
        j += 2;
        while (j < n && /[\da-fA-F_]/.test(code[j])) j++;
      } else {
        while (j < n && /[\d_]/.test(code[j])) j++;
        if (j < n && code[j] === '.') {
          j++;
          while (j < n && /[\d_]/.test(code[j])) j++;
        }
        if (j < n && /[eE]/.test(code[j])) {
          j++;
          if (j < n && /[+-]/.test(code[j])) j++;
          while (j < n && /\d/.test(code[j])) j++;
        }
      }
      out += span('num', code.slice(i, j));
      i = j;
      lastDot = false;
      continue;
    }

    // ── Identifier ────────────────────────────────────────────────────────────
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i;
      while (j < n && /[\w$]/.test(code[j])) j++;
      const word = code.slice(i, j);

      let k = j;
      while (k < n && (code[k] === ' ' || code[k] === '\t')) k++;
      const callsFollow = code[k] === '(';

      if (lastDot) {
        out += callsFollow ? span('method', word) : span('prop', word);
      } else if (KEYWORDS.has(word)) {
        out += span('kw', word);
      } else if (BUILTIN_TYPES.has(word)) {
        out += span('tp', word);
      } else if (callsFollow) {
        out += span('fn', word);
      } else {
        out += esc(word);
      }

      i = j;
      lastDot = false;
      continue;
    }

    // ── Optional chaining ?. ──────────────────────────────────────────────────
    if (ch === '?' && code[i + 1] === '.') {
      const nextIsIdent = i + 2 < n && /[a-zA-Z_$]/.test(code[i + 2]);
      out += span('op', '?.');
      i += 2;
      lastDot = nextIsIdent;
      continue;
    }

    // ── Regular dot (property access) ─────────────────────────────────────────
    if (ch === '.') {
      const nextIsIdent = i + 1 < n && /[a-zA-Z_$]/.test(code[i + 1]);
      out += '.';
      i++;
      lastDot = nextIsIdent;
      continue;
    }

    // ── Multi-char operators ──────────────────────────────────────────────────
    lastDot = false;
    const c3 = code.slice(i, i + 3);
    const c2 = code.slice(i, i + 2);

    if (['===', '!==', '>>>', '...', '>>=', '<<=', '**=', '??=', '&&=', '||='].includes(c3)) {
      out += span('op', c3);
      i += 3;
      continue;
    }
    if (
      [
        '=>',
        '==',
        '!=',
        '>=',
        '<=',
        '&&',
        '||',
        '??',
        '++',
        '--',
        '**',
        '+=',
        '-=',
        '*=',
        '/=',
        '%=',
        '&=',
        '|=',
        '^=',
        '<<',
        '>>',
        '?:',
      ].includes(c2)
    ) {
      out += span('op', c2);
      i += 2;
      continue;
    }

    // ── Single-char operators ─────────────────────────────────────────────────
    if ('=+-*/%&|^~!<>?:@'.includes(ch)) {
      out += span('op', ch);
      i++;
      continue;
    }

    // ── Everything else (whitespace, braces, commas, etc.) ───────────────────
    out += esc(ch);
    i++;
  }

  return out;
}
