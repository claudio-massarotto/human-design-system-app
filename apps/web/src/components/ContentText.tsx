import { cn } from '../lib/cn';

/** Testo dei contenuti: paragrafi separati da una riga vuota ('\n\n'). */
export function ContentText({ text, className }: { text: string; className?: string }) {
  const paragraphs = text
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className={cn('flex flex-col gap-3 text-[15px] leading-relaxed', className)}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
