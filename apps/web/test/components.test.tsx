import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { i18n } from '../src/i18n';
import { SettingsProvider } from '../src/data/SettingsProvider';
import { ElementDetail } from '../src/components/ElementDetail';
import { ContentText } from '../src/components/ContentText';
import { PlanetGlyph, PLANET_GLYPHS } from '../src/components/PlanetGlyph';
import { SegmentedControl } from '../src/components/ui/SegmentedControl';
import { Field, Input } from '../src/components/ui/Field';
import { TagField } from '../src/components/TagField';

function wrap(ui: React.ReactNode) {
  return render(
    <I18nextProvider i18n={i18n}>
      <SettingsProvider>{ui}</SettingsProvider>
    </I18nextProvider>,
  );
}

describe('ContentText', () => {
  it('separa i paragrafi su "\\n\\n"', () => {
    const { container } = render(<ContentText text={'Uno.\n\nDue.\n\n\n\nTre.'} />);
    expect(container.querySelectorAll('p')).toHaveLength(3);
  });
});

describe('PlanetGlyph', () => {
  it('ha un glifo per ciascuna delle 13 attivazioni', () => {
    expect(Object.keys(PLANET_GLYPHS)).toHaveLength(13);
    expect(PLANET_GLYPHS.sun).toBe('☉');
    expect(PLANET_GLYPHS.earth).toBe('⊕');
    render(<PlanetGlyph body="pluto" label="Plutone" />);
    expect(screen.getByRole('img', { name: 'Plutone' })).toBeInTheDocument();
  });
});

describe('SegmentedControl', () => {
  function Demo() {
    const [v, setV] = useState<'a' | 'b' | 'c'>('a');
    return (
      <SegmentedControl<'a' | 'b' | 'c'>
        aria-label="Scelta"
        value={v}
        onChange={setV}
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
          { value: 'c', label: 'C' },
        ]}
      />
    );
  }
  it('si usa con la tastiera (frecce) e ha semantica radio', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    expect(screen.getByRole('radiogroup', { name: 'Scelta' })).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('radio', { name: 'A' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
    await user.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'C' })).toBeChecked();
    await user.keyboard('{ArrowRight}'); // si riavvolge
    expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
  });
});

describe('Field', () => {
  it('collega etichetta, suggerimento ed errore al controllo', () => {
    render(
      <Field label="Nome" hint="Suggerimento" error="Errore!">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText('Nome');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const described = input.getAttribute('aria-describedby') ?? '';
    expect(described.split(' ')).toHaveLength(2);
    expect(screen.getByRole('alert')).toHaveTextContent('Errore!');
  });
});

describe('ElementDetail', () => {
  it('porta: nome, esagramma e le sei linee (livello semplice)', async () => {
    wrap(<ElementDetail target={{ kind: 'gate', gate: 34 }} level="simple" />);
    await waitFor(() => expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument());
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(6);
    expect(screen.getByText('34.1')).toBeInTheDocument();
    expect(screen.getByText('34.6')).toBeInTheDocument();
  });

  it('il livello approfondito aggiunge la descrizione', () => {
    const simple = wrap(<ElementDetail target={{ kind: 'center', id: 'sacral' }} level="simple" />);
    const simpleLen = simple.container.textContent?.length ?? 0;
    simple.unmount();
    const deep = wrap(<ElementDetail target={{ kind: 'center', id: 'sacral' }} level="deep" />);
    expect(deep.container.textContent!.length).toBeGreaterThan(simpleLen);
  });

  it('supporta tutti i tipi di target senza errori', () => {
    const targets = [
      { kind: 'gate', gate: 1 },
      { kind: 'line', gate: 1, line: 3 },
      { kind: 'channel', id: '1-8' },
      { kind: 'center', id: 'g' },
      { kind: 'type', id: 'projector' },
      { kind: 'authority', id: 'emotional' },
      { kind: 'profile', id: '2/4' },
      { kind: 'definition', id: 'split' },
      { kind: 'cross', slug: 'rax-sphinx', number: 2 },
      { kind: 'circuit', id: 'tribalEgo' },
      { kind: 'planet', body: 'northNode' },
    ] as const;
    for (const target of targets) {
      const r = wrap(<ElementDetail target={target} />);
      expect(r.container.querySelector('h2'), JSON.stringify(target)).not.toBeNull();
      r.unmount();
    }
  });

  it('mostra un messaggio per contenuti inesistenti', () => {
    wrap(<ElementDetail target={{ kind: 'gate', gate: 99 }} />);
    expect(screen.getByText(/non disponibile/i)).toBeInTheDocument();
  });
});

describe('TagField', () => {
  function Demo({
    initial = [],
    suggestions = [],
  }: {
    initial?: string[];
    suggestions?: string[];
  }) {
    const [tags, setTags] = useState<string[]>(initial);
    return (
      <form onSubmit={(e) => e.preventDefault()}>
        <TagField value={tags} onChange={setTags} suggestions={suggestions} />
        <output data-testid="out">{JSON.stringify(tags)}</output>
      </form>
    );
  }
  const out = () => JSON.parse(screen.getByTestId('out').textContent ?? '[]');

  it('Invio e virgola aggiungono, senza doppioni né maiuscole diverse', async () => {
    const user = userEvent.setup();
    wrap(<Demo />);
    const input = screen.getByRole('textbox', { name: /^Etichette/ });
    await user.type(input, 'Clienti{Enter}');
    await user.type(input, 'clienti,');
    await user.type(input, '  Studio  {Enter}');
    expect(out()).toEqual(['Clienti', 'Studio']);
    expect(input).toHaveValue('');
  });

  it('rimuove con il pulsante e con Backspace a campo vuoto', async () => {
    const user = userEvent.setup();
    wrap(<Demo initial={['A', 'B', 'C']} />);
    await user.click(screen.getByRole('button', { name: "Rimuovi l'etichetta B" }));
    expect(out()).toEqual(['A', 'C']);
    await user.click(screen.getByRole('textbox', { name: /^Etichette/ }));
    await user.keyboard('{Backspace}');
    expect(out()).toEqual(['A']);
  });

  it("il testo scritto e lasciato nel campo viene aggiunto all'uscita dal campo", async () => {
    const user = userEvent.setup();
    wrap(<Demo />);
    await user.type(screen.getByRole('textbox', { name: /^Etichette/ }), 'Famiglia');
    await user.tab();
    expect(out()).toEqual(['Famiglia']);
  });

  it('propone le etichette esistenti e ne riusa la grafia', async () => {
    const user = userEvent.setup();
    wrap(<Demo suggestions={['Preferiti', 'Clienti']} />);
    await user.click(screen.getByRole('button', { name: "Aggiungi l'etichetta Preferiti" }));
    expect(out()).toEqual(['Preferiti']);
    expect(screen.queryByRole('button', { name: "Aggiungi l'etichetta Preferiti" })).toBeNull();
    await user.type(screen.getByRole('textbox', { name: /^Etichette/ }), 'clienti{Enter}');
    expect(out()).toEqual(['Preferiti', 'Clienti']);
  });

  it('si ferma al massimo di etichette', async () => {
    wrap(<Demo initial={Array.from({ length: 10 }, (_, i) => `e${i}`)} />);
    expect(screen.getByRole('textbox', { name: /^Etichette/ })).toBeDisabled();
  });
});
