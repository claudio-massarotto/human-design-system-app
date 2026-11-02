// Esportazione del bodygraph: SVG autonomo (variabili CSS risolte) e PNG.

/**
 * Sostituisce ogni `var(--nome[, fallback])` con il valore risolto (annidamenti inclusi).
 * Funzione pura: `values` mappa il nome della variabile (con `--`) al suo valore.
 */
export function resolveCssVars(input: string, values: Readonly<Record<string, string>>): string {
  const re = /var\(/g;
  let out = '';
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(input)) !== null) {
    const start = match.index;
    if (start < last) continue;
    let depth = 1;
    let i = start + 4;
    while (i < input.length && depth > 0) {
      const ch = input[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      i++;
    }
    const inner = input.slice(start + 4, i - 1);
    const comma = inner.indexOf(',');
    const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma === -1 ? '' : inner.slice(comma + 1).trim();
    const known = values[name]?.trim();
    const resolved = known ? known : resolveCssVars(fallback, values);
    out += input.slice(last, start) + resolved;
    last = i;
    re.lastIndex = i;
  }
  return out + input.slice(last);
}

/** Nomi delle variabili CSS (`--x`) usate in un testo. */
export function cssVarNames(input: string): string[] {
  const names = new Set<string>();
  for (const m of input.matchAll(/var\(\s*(--[\w-]+)/g)) names.add(m[1]!);
  return [...names];
}

const STATIC_STYLE = '.hdbg-anim,.hdbg-fade{animation:none!important}';

interface Serialized {
  markup: string;
  width: number;
  height: number;
  background: string | null;
}

function serialize(svg: SVGSVGElement): Serialized {
  const view = svg.viewBox?.baseVal;
  const width = view && view.width > 0 ? view.width : svg.getBoundingClientRect().width || 400;
  const height = view && view.height > 0 ? view.height : svg.getBoundingClientRect().height || 640;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  clone.removeAttribute('class');
  clone.removeAttribute('style');
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = STATIC_STYLE;
  clone.appendChild(style);

  const raw = new XMLSerializer().serializeToString(clone);
  const computed = getComputedStyle(svg);
  const values: Record<string, string> = {};
  for (const name of [...cssVarNames(raw), '--color-bg']) {
    const value = computed.getPropertyValue(name).trim();
    if (value) values[name] = value;
  }
  return {
    markup: resolveCssVars(raw, values),
    width,
    height,
    background: values['--color-bg'] ?? null,
  };
}

/**
 * Serializza l'SVG come file autonomo: le variabili CSS del tema sono sostituite dai valori
 * risolti, così l'export conserva i colori del tema e non dipende dal documento ospite.
 */
export function svgToString(svg: SVGSVGElement): string {
  const { markup } = serialize(svg);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${markup}`;
}

export interface ExportPngOptions {
  /** Colore di sfondo; predefinito `--color-bg` risolto, `null` per sfondo trasparente. */
  background?: string | null;
}

/** Rasterizza l'SVG in un PNG (canvas) alla scala indicata (predefinita 2×). */
export async function exportPng(
  svg: SVGSVGElement,
  scale = 2,
  options: ExportPngOptions = {},
): Promise<Blob> {
  const { markup, width, height, background } = serialize(svg);
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    image.decoding = 'async';
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Impossibile rasterizzare il bodygraph'));
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D non disponibile');
    const fill = options.background === undefined ? background : options.background;
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Esportazione PNG fallita'))),
        'image/png',
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
