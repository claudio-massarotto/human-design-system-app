# ADR-004 — Licenza AGPL-3.0 e repository pubblica

- **Stato**: ✅ accettata (2026-11-02)

## Decisione

- Il codice dell'app è rilasciato con licenza **GNU AGPL-3.0-or-later**, coerente con Swiss Ephemeris
  (ADR-001). La repository GitHub è **pubblica**.
- I **contenuti interpretativi** (`packages/content`) sono testi originali del progetto e ricadono nella
  stessa licenza; nessun testo protetto di terzi (Jovian Archive, Gene Keys, IHDS) viene incluso.

## Conseguenze

- Chi usa l'app (anche via rete, quando ci sarà il server) deve poter ottenere il sorgente: link al
  repository nella schermata "Informazioni".
- Le dipendenze devono essere compatibili con AGPL (MIT, BSD, Apache-2.0, ISC, LGPL, GPL-3 vanno bene).
- In alternativa futura: licenza professionale Swiss Ephemeris (~CHF 700) se si volesse chiudere il codice.
