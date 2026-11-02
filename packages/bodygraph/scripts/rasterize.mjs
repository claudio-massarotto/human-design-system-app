// Converte gli SVG di preview/ in PNG con Quick Look (macOS): qlmanage -t -s 1400.
import { execFileSync } from 'node:child_process';
import { readdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'preview');
for (const file of readdirSync(dir).filter((f) => f.endsWith('.svg'))) {
  execFileSync('qlmanage', ['-t', '-s', '1400', '-o', dir, join(dir, file)], { stdio: 'ignore' });
  renameSync(join(dir, `${file}.png`), join(dir, file.replace(/\.svg$/, '.png')));
}
console.log('PNG scritti in', dir);
