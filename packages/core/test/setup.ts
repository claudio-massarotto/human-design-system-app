// In Node il loader Emscripten di @swisseph/browser carica il .wasm con fetch(),
// che non supporta gli URL file://. Lo shim legge il file da disco.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (url.startsWith('file:')) {
    const body = await readFile(fileURLToPath(url));
    return new Response(body, { headers: { 'Content-Type': 'application/wasm' } });
  }
  return realFetch(input, init);
}) as typeof fetch;
