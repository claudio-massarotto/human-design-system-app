import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { createMemoryRouter, RouterProvider } from 'react-router';
import type { Engine } from '@hd/core';
import { getContent } from '@hd/content';
import { i18n } from '../../i18n';
import { SettingsProvider } from '../../data/SettingsProvider';
import { EngineTestProvider } from '../../lib/engine';
import { routes } from './routes';
import {
  PATHS_STORAGE_KEY,
  completedCount,
  lessonLinkInfo,
  nextLessonId,
  readProgress,
} from './learning';

const content = getContent('it');
const basi = content.paths.find((p) => p.id === 'basi')!;

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <I18nextProvider i18n={i18n}>
      <SettingsProvider>
        <EngineTestProvider value={{} as Engine}>
          <RouterProvider router={router} />
        </EngineTestProvider>
      </SettingsProvider>
    </I18nextProvider>,
  );
  return router;
}

beforeEach(() => localStorage.clear());

describe('logica dei percorsi', () => {
  it('ogni collegamento di lezione ha un titolo e un URL dell’enciclopedia', () => {
    for (const lang of ['it', 'en'] as const) {
      const c = getContent(lang);
      for (const p of c.paths)
        for (const l of p.lessons)
          for (const link of l.links) {
            const info = lessonLinkInfo(c, link);
            expect(info.href).toMatch(/^\/enciclopedia\/[a-z]+\/[^/]+$/);
            expect(info.label, `${link.section}/${link.id}`).not.toBe(link.id);
          }
    }
  });

  it('progresso: conteggio, prossima lezione e storage rovinato', () => {
    expect(readProgress()).toEqual({});
    localStorage.setItem(
      PATHS_STORAGE_KEY,
      JSON.stringify({ basi: ['mappa', 'tipi', 'inesistente'] }),
    );
    expect(completedCount(basi, readProgress())).toBe(2);
    expect(nextLessonId(basi, readProgress())).toBe('strategia');
    localStorage.setItem(PATHS_STORAGE_KEY, '{non json');
    expect(readProgress()).toEqual({});
  });
});

describe('pagine dei percorsi', () => {
  it('l’elenco mostra tutti i percorsi', async () => {
    renderAt('/enciclopedia/percorsi');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Percorsi di apprendimento' }),
    ).toBeInTheDocument();
    for (const p of content.paths)
      expect(screen.getByRole('link', { name: new RegExp(p.title) })).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar')).toHaveLength(content.paths.length);
  });

  it('la lezione mostra testo, collegamenti e indicatore di avanzamento', async () => {
    renderAt('/enciclopedia/percorsi/basi/tipi');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'I cinque tipi' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Lezione 2 di 5/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(
      screen
        .getAllByRole('link')
        .some((l) => l.getAttribute('href') === '/enciclopedia/tipi/projector'),
    ).toBe(true);
  });

  it('avanti salva il progresso e passa alla lezione successiva; indietro torna', async () => {
    const user = userEvent.setup();
    renderAt('/enciclopedia/percorsi/basi/mappa');
    await screen.findByRole('heading', { level: 1, name: 'Il chart come mappa' });
    await user.click(screen.getByRole('button', { name: /Successiva/ }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'I cinque tipi' }),
    ).toBeInTheDocument();
    expect(readProgress().basi).toEqual(['mappa']);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    await user.click(screen.getByRole('link', { name: /Precedente/ }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Il chart come mappa' }),
    ).toBeInTheDocument();
  });

  it('l’ultima lezione conclude il percorso e torna alla panoramica', async () => {
    const user = userEvent.setup();
    const last = basi.lessons.at(-1)!;
    const router = renderAt(`/enciclopedia/percorsi/basi/${last.id}`);
    await screen.findByRole('heading', { level: 1, name: last.title });
    await user.click(screen.getByRole('button', { name: 'Concludi il percorso' }));
    expect(router.state.location.pathname).toBe('/enciclopedia/percorsi/basi');
    expect(readProgress().basi).toContain(last.id);
  });

  it('la domanda di verifica dà esito e spiegazione', async () => {
    const user = userEvent.setup();
    renderAt('/enciclopedia/percorsi/basi/mappa');
    await screen.findByRole('heading', { level: 1, name: 'Il chart come mappa' });
    const quiz = basi.lessons[0]!.quiz!;
    const form = screen.getByRole('group', { name: /Verifica/ }).closest('form')!;
    expect(within(form).getByRole('button', { name: 'Verifica' })).toBeDisabled();
    await user.click(within(form).getByRole('radio', { name: quiz.options[0]! }));
    await user.click(within(form).getByRole('button', { name: 'Verifica' }));
    expect(within(form).getByRole('status')).toHaveTextContent('Non proprio.');
    await user.click(within(form).getByRole('radio', { name: quiz.options[quiz.correct]! }));
    await user.click(within(form).getByRole('button', { name: 'Verifica' }));
    expect(within(form).getByRole('status')).toHaveTextContent('Giusto!');
    expect(within(form).getByRole('status')).toHaveTextContent(quiz.explanation);
  });

  it('il livello approfondito mostra l’approfondimento della lezione', async () => {
    const user = userEvent.setup();
    renderAt('/enciclopedia/percorsi/basi/tipi');
    await screen.findByRole('heading', { level: 1, name: 'I cinque tipi' });
    const deep = basi.lessons[1]!.deep!.split('\n\n')[0]!;
    expect(screen.queryByText(deep)).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Approfondito' }));
    expect(screen.getByText(deep)).toBeInTheDocument();
  });

  it('percorso o lezione inesistenti mostrano la voce non trovata', async () => {
    renderAt('/enciclopedia/percorsi/inesistente');
    expect(await screen.findByRole('heading', { name: 'Voce non trovata' })).toBeInTheDocument();
  });
  it('lezione inesistente', async () => {
    renderAt('/enciclopedia/percorsi/basi/zzz');
    expect(await screen.findByRole('heading', { name: 'Voce non trovata' })).toBeInTheDocument();
  });

  it('la panoramica segna le lezioni completate e permette di azzerare', async () => {
    const user = userEvent.setup();
    localStorage.setItem(PATHS_STORAGE_KEY, JSON.stringify({ basi: ['mappa'] }));
    renderAt('/enciclopedia/percorsi/basi');
    await screen.findByRole('heading', { level: 1, name: 'Le basi' });
    expect(screen.getByText('Lezione completata')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Azzera il progresso' }));
    expect(readProgress()).toEqual({});
  });
});
