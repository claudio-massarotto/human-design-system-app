import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Bodygraph } from '../src/Bodygraph';
import { cssVarNames, resolveCssVars, svgToString } from '../src/export';
import { modelFromGates } from '../src/model';

afterEach(cleanup);

describe('resolveCssVars', () => {
  it('sostituisce le variabili con i valori, o con il fallback', () => {
    expect(
      resolveCssVars('fill="var(--a, #fff)" stroke="var(--b)"', { '--a': '#123', '--b': 'red' }),
    ).toBe('fill="#123" stroke="red"');
    expect(resolveCssVars('var(--missing, #abc)', {})).toBe('#abc');
  });

  it('gestisce fallback annidati', () => {
    expect(resolveCssVars('var(--x, var(--y, #000))', { '--y': 'blue' })).toBe('blue');
    expect(resolveCssVars('var(--x, var(--y, #000))', {})).toBe('#000');
    expect(
      resolveCssVars('a var(--x, var(--y)) b var(--z, #111)', { '--x': '1', '--z': '2' }),
    ).toBe('a 1 b 2');
  });

  it('elenca i nomi delle variabili usate', () => {
    expect(cssVarNames('var(--a, var(--b)) var(--a)').sort()).toEqual(['--a', '--b']);
  });
});

describe('svgToString', () => {
  it('produce un SVG autonomo con i colori del tema risolti', () => {
    const { container } = render(<Bodygraph model={modelFromGates({ personality: [1, 8] })} />);
    const svg = container.querySelector('svg')!;
    svg.style.setProperty('--color-personality', '#112233');
    svg.style.setProperty('--center-g', '#445566');
    const text = svgToString(svg);
    expect(text.startsWith('<?xml')).toBe(true);
    expect(text).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(text).toContain('#112233');
    expect(text).toContain('#445566');
    expect(text).not.toContain('var(');
    expect(text).toContain('width="400"');
    expect(text).toContain('animation:none');
  });
});
