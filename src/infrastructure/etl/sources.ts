import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface ManifestEntry {
  path: string;
  sha256: string;
}

interface Manifest {
  files: ManifestEntry[];
}

const sourceDir = join(process.cwd(), 'data', 'source');

export async function readVerifiedJson<T>(name: string): Promise<T> {
  const manifest = JSON.parse(await readFile(join(sourceDir, 'manifest.json'), 'utf8')) as Manifest;
  const entry = manifest.files.find((item) => item.path === name);
  if (!entry) throw new Error(`El archivo ${name} no está en manifest.json`);
  const content = await readFile(join(sourceDir, name));
  const hash = createHash('sha256').update(content).digest('hex').toUpperCase();
  if (hash !== entry.sha256) throw new Error(`Hash inválido para ${name}: ${hash}`);
  return JSON.parse(content.toString('utf8').replace(/^\uFEFF/, '')) as T;
}
