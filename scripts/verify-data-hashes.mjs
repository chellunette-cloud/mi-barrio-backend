import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = 'data/source';
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
const failures = [];

for (const entry of manifest.files) {
  const content = readFileSync(join(root, entry.path));
  const hash = createHash('sha256').update(content).digest('hex').toUpperCase();
  if (hash !== entry.sha256) failures.push(`${entry.path}: ${hash} != ${entry.sha256}`);
  else console.log(`OK ${entry.path} ${hash}`);
}

if (failures.length) {
  console.error('Hashes de snapshots no coinciden:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`OK: ${manifest.files.length} snapshots verificados contra manifest.json.`);
