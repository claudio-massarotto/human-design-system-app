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

`SavedChart` contiene solo i **dati di nascita** e i metadati (nome, relazione, note, date di
creazione/modifica, `schemaVersion`): il chart si ricalcola sempre dal motore, quindi una correzione
del motore si riflette subito su tutti i chart salvati.

## Privacy

- I dati di nascita non lasciano il dispositivo nella fase 1 (unica eccezione: la ricerca del nome
  della città verso il servizio di geocoding, senza data/ora).
- Cancellazione totale dei dati dalle impostazioni.
