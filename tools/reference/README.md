# Calcolatore di riferimento (Swiss Ephemeris)

Implementazione indipendente in Python, basata su Swiss Ephemeris (`pyswisseph`, modalità Moshier),
usata **solo in sviluppo** come oracolo per validare il motore TypeScript (non viene distribuita con l'app).

```bash
python3 -m venv .venv && .venv/bin/pip install -r tools/reference/requirements.txt
.venv/bin/python tools/reference/hd_ref.py 1948 4 9 5 5     # anno mese giorno ora minuto (UTC)
.venv/bin/python tools/reference/refcheck.py                # 10 chart pubblicati di riferimento
```

Licenza: pyswisseph/Swiss Ephemeris è AGPL — accettabile per uno strumento di sviluppo non distribuito.

## Confronto astronomy-engine ↔ Swiss Ephemeris

```bash
cd tools/reference/compare && npm i --no-save astronomy-engine@2.1.19
END_YEAR=2026 OUT=sample.json node sample-astronomy-engine.mjs    # 2000 istanti casuali (seed fisso)
../../../.venv/bin/python -I compare.py sample.json                 # scarti e livelli diversi
```

Opzionale: `SWE_DT=1` usa una tabella ΔT (`deltat.json`, generata da Swiss Ephemeris) al posto di quella di astronomy-engine.
