# ADR-003 — Dati utente: prima sul dispositivo, poi cloud

- **Stato**: ✅ accettata (2026-11-02)

## Decisione

- **Fase 1**: chart salvati e preferenze in **IndexedDB** (libreria Dexie), solo sul dispositivo.
  Export/import JSON per backup e cambio dispositivo.
- **Fase 2**: sincronizzazione cloud tramite `apps/server` (ADR-002), con account.

## Contratto

L'app accede ai dati solo tramite interfacce, così l'implementazione cloud si aggiunge senza toccare le schermate:

```ts
interface ChartRepository {
  list(): Promise<SavedChart[]>;
  get(id: string): Promise<SavedChart | undefined>;
  save(chart: SavedChart): Promise<void>;      // crea o aggiorna
  remove(id: string): Promise<void>;
}
interface SettingsRepository {
  get(): Promise<Settings>;
  update(patch: Partial<Settings>): Promise<Settings>;
}
```

`SavedChart` contiene solo i **dati di nascita** e i metadati (nome, relazione, note, etichette libere,
date di creazione/modifica, `schemaVersion`): il chart si ricalcola sempre dal motore, quindi una
correzione del motore si riflette subito su tutti i chart salvati.

## Aggiornamento: schema v2 — etichette e diario (2026-11-06)

Il modello dati cresce senza cambiare il principio (solo dati dell'utente, mai il chart calcolato):

- `SavedChart.tags?: string[]` — **etichette libere** (es. Preferiti, Clienti, Studio) accanto alla
  relazione. Campo facoltativo: i chart esistenti restano validi e `schemaVersion` resta 1.
- `JournalEntry` — **note del diario di sperimentazione** per chart (`id`, `chartId`, `date`, `text`,
  `outcome?`, `mood?`, `createdAt`, `updatedAt`), nella nuova tabella `notes`.
- Nuovo contratto, con la stessa filosofia dei repository esistenti:

```ts
interface JournalRepository {
  listByChart(chartId: string): Promise<JournalEntry[]>; // dalla più recente
  listAll(): Promise<JournalEntry[]>;                    // per il backup
  get(id: string): Promise<JournalEntry | undefined>;
  save(entry: JournalEntry): Promise<void>;              // crea o aggiorna
  remove(id: string): Promise<void>;
  removeByChart(chartId: string): Promise<void>;
}
```

- **Dexie `version(2)`**: indice multiEntry `*tags` su `charts` e tabella `notes`
  (`id, chartId, date, [chartId+date]`). Migrazione non distruttiva: nessuna riga viene riscritta.
- **Eliminazione a cascata**: `ChartRepository.remove(id)` elimina il chart e le sue note in una sola
  transazione; la cancellazione totale dei dati svuota anche `notes`.
- **Backup**: formato `hd-system-backup` alla `version: 2` (aggiunge `notes[]` e `tags`); la `version: 1`
  resta leggibile. Un file non conforme (anche in una sola nota) è rifiutato per intero.
- **Privacy**: le note del diario restano sul dispositivo come i dati di nascita; in fase 2 seguiranno la
  stessa sincronizzazione dei chart.

## Privacy

- I dati di nascita non lasciano il dispositivo nella fase 1 (unica eccezione: la ricerca del nome
  della città verso il servizio di geocoding, senza data/ora).
- Cancellazione totale dei dati dalle impostazioni.
