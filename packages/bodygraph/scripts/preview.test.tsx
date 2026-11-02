// Genera anteprime statiche SVG del bodygraph (tema chiaro/scuro) in packages/bodygraph/preview/.
// Esecuzione: pnpm --filter @hd/bodygraph preview   (passa da vitest per compilare il TSX)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Bodygraph } from '../src/Bodygraph';
import { resolveCssVars } from '../src/export';
import { modelFromGates } from '../src/model';
import { GATE_POSITIONS, VIEWBOX } from '../src/layout';
import type { BodygraphModel, Selection } from '../src/types';

const THEMES: Record<string, Record<string, string>> = {
  light: {
    '--color-bg': '#FAF7F2',
    '--color-surface': '#FFFFFF',
    '--color-border': '#CFC7B8',
    '--color-text': '#1C1A24',
    '--color-muted': '#6B6578',
    '--color-accent': '#A87A28',
    '--color-accent-2': '#5B4BC4',
    '--color-personality': '#1C1A24',
    '--color-design': '#C8323B',
    '--color-transit': '#1F8A96',
    '--color-channel-inactive': '#DDD6C8',
  },
  dark: {
    '--color-bg': '#0B0A14',
    '--color-surface': '#15131F',
    '--color-border': '#3A3555',
    '--color-text': '#EDE9F5',
    '--color-muted': '#9C95B0',
    '--color-accent': '#E3B964',
    '--color-accent-2': '#8B7CF6',
    '--color-personality': '#EDE9F5',
    '--color-design': '#E5484D',
    '--color-transit': '#4FB3BF',
    '--color-channel-inactive': '#2C2840',
  },
};

const allGates = Object.keys(GATE_POSITIONS).map(Number);

const models: Record<string, { model: BodygraphModel; selected?: Selection }> = {
  empty: { model: modelFromGates({}) },
  chart: {
    model: modelFromGates({
      personality: [
        34, 20, 57, 10, 59, 6, 14, 2, 5, 15, 29, 46, 21, 45, 26, 44, 12, 22, 47, 64, 17, 62, 18, 58,
        28,
      ],
      design: [
        34, 57, 10, 20, 27, 50, 3, 60, 42, 53, 9, 52, 19, 49, 30, 41, 1, 8, 7, 31, 16, 48, 25, 51,
        61, 24, 11, 56, 38, 28,
      ],
    }),
  },
  transit: {
    model: modelFromGates(
      {
        personality: [34, 57, 10, 20, 59, 6, 14, 2, 12, 22, 47, 64, 17, 62],
        design: [34, 27, 50, 3, 60, 19, 49, 1, 8, 16, 48],
        transit: [20, 10, 35, 36, 25, 51, 21, 26, 44, 34, 41, 30, 55, 39, 4, 63, 11, 56],
      },
      { conditioned: ['heart', 'solarPlexus'] },
    ),
    selected: { kind: 'channel', id: '34-57' },
  },
  all: { model: modelFromGates({ personality: allGates }) },
  allmixed: {
    model: modelFromGates({
      personality: allGates.filter((g) => g % 2 === 0),
      design: allGates.filter((g) => g % 3 !== 0),
      transit: allGates.filter((g) => g % 5 === 0),
    }),
  },
};

const out = join(process.cwd(), 'preview');

function generate(): void {
  mkdirSync(out, { recursive: true });
  for (const [name, { model, selected }] of Object.entries(models)) {
    for (const [theme, vars] of Object.entries(THEMES)) {
      let svg = renderToStaticMarkup(
        <Bodygraph model={model} animate={false} selected={selected ?? null} onSelect={() => {}} />,
      );
      svg = resolveCssVars(svg, vars);
      // viewBox quadrato (Quick Look produce miniature quadrate): il bodygraph resta centrato.
      const pad = 16;
      const size = VIEWBOX.height + pad * 2;
      const x0 = (VIEWBOX.width - size) / 2;
      const y0 = -pad;
      svg = svg.replace(/<svg [^>]*viewBox="[^"]*"/, (m) =>
        m.replace(
          /viewBox="[^"]*"/,
          `viewBox="${x0} ${y0} ${size} ${size}" width="${size * 2}" height="${size * 2}"`,
        ),
      );
      svg = svg.replace(
        /(<svg [^>]*>)/,
        `$1<rect x="${x0}" y="${y0}" width="${size}" height="${size}" fill="${vars['--color-bg']}"/>`,
      );
      writeFileSync(join(out, `${name}-${theme}.svg`), svg);
    }
  }
  console.log('preview svg scritti in', out);
}

test('genera le anteprime SVG', generate);
