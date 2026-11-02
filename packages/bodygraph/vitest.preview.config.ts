import { defineConfig } from 'vitest/config';

// Solo per generare le anteprime: pnpm --filter @hd/bodygraph preview
export default defineConfig({ test: { environment: 'node', include: ['scripts/*.test.tsx'] } });
