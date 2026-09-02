import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const patterns = [
  /\bU1\b/g,
  /\bU2\b/g,
  /\bStage(?:\s+[A-Z0-9.]+)?\b/g,
  /\bP1\b/g,
  /\bA1\b/g,
  /\bA2\b/g,
  /\bA3\b/g,
  /\bdebug\b/gi,
  /\bplaceholder\b/gi,
  /\bTODO\b/g,
  /email métier/gi,
  /notifications U1/gi,
  /phase U1/gi,
];

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const resolved = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(resolved) : entry.name.endsWith('.html') ? [resolved] : [];
  });
}

function visibleText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ');
}

if (!fs.existsSync(dist)) throw new Error('dist/ absent : lancez le build avant cet audit.');

const findings = [];
for (const file of htmlFiles(dist)) {
  const text = visibleText(fs.readFileSync(file, 'utf8'));
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) findings.push({ file: path.relative(root, file), label: match[0] });
  }
}

if (findings.length) {
  console.error(JSON.stringify({ INTERNAL_PROJECT_LABELS_VISIBLE: findings.length, findings }, null, 2));
  process.exit(1);
}

console.log('INTERNAL_PROJECT_LABELS_VISIBLE = 0');
