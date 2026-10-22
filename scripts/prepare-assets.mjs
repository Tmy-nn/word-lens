// Used as scripts/prepare-assets.mjs in the exported repository.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const distribution = 'https://word-lens.ai-knowledge-board.workers.dev/';
const verifyOnly = process.argv.includes('--verify-only');
for (const group of ['detector', 'expanded']) {
  const manifest = JSON.parse(await readFile(resolve(root, 'public', group, 'manifest.json'), 'utf8'));
  for (const [name, expected] of Object.entries(manifest.files)) {
    if (!/^[a-zA-Z0-9_./-]+$/.test(name) || name.startsWith('/') || name.split('/').includes('..')) throw Error('Unsafe manifest path');
    const target = resolve(root, 'public', group, name);
    let bytes;
    try { bytes = await readFile(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (bytes) {
      if (bytes.length !== expected.bytes || digest(bytes) !== expected.sha256) throw Error(`Existing asset differs: ${group}/${name}. Preserve it separately before retrying.`);
      console.log(`verified ${group}/${name}`);
      continue;
    }
    if (verifyOnly) throw Error(`Missing asset: ${group}/${name}`);
    if (group === 'expanded' && name.startsWith('ort')) {
      bytes = await readFile(resolve(root, 'node_modules/onnxruntime-web/dist', name));
    } else if (group === 'detector' && (name === 'vision_bundle.js' || name.startsWith('wasm/'))) {
      bytes = await readFile(resolve(root, 'node_modules/@mediapipe/tasks-vision', name));
    } else {
      // Original Lite2 comes from Google; the converted ONNX artifact is hosted by this app.
      const url = group === 'detector' && name === 'efficientdet_lite2.tflite'
        ? manifest.model : new URL(`${group}/${name}`, distribution).href;
      const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
      if (!response.ok) throw Error(`Asset download failed (${response.status}): ${group}/${name}`);
      bytes = new Uint8Array(await response.arrayBuffer());
    }
    if (bytes.length !== expected.bytes || digest(bytes) !== expected.sha256) throw Error(`Asset verification failed: ${group}/${name}`);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes, { flag: 'wx' });
    console.log(`prepared ${group}/${name}`);
  }
}
console.log('All model and runtime files match the pinned manifests.');
