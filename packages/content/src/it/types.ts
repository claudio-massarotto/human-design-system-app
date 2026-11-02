import type { TypeContent } from '../types';
import type { HDType } from '@hd/core';

export const types: Record<HDType, TypeContent> = {
  manifestor: {
    id: 'manifestor',
    name: 'Manifestatore',
    summary:
      'Il Manifestatore è fatto per dare inizio alle cose, senza aspettare che qualcuno lo chiami. Il suo gesto più utile è informare chi sarà toccato dalle sue mosse.',
    description:
      'Nel Human Design il Manifestatore ha il Sacrale non definito e un motore (Cuore, Plesso Solare o Radice) collegato alla Gola. In pratica, un impulso può trasformarsi direttamente in parola o azione: per questo viene descritto come il Tipo dell\'iniziativa.\n\nLa sua aura è chiusa e compatta. Gli altri possono percepirla come intensa o difficile da leggere, e talvolta reagiscono con diffidenza anche quando le intenzioni sono innocue. Informare prima di agire, in modo semplice e breve, serve ad alleggerire questa reazione e a ottenere più spazio.\n\nSecondo la tradizione, quando il Manifestatore agisce a modo suo e comunica, vive la pace; quando si sente controllato o bloccato, compare la rabbia. È un modello simbolico, non una diagnosi: può servire come spunto di osservazione.',
    strategy: 'Informare prima di agire',
    signature: 'Pace',
    notSelf: 'Rabbia',
    aura: 'Chiusa e respingente: ha un impatto forte e gli altri la sentono come intensa.',
    population: '~9%',
    tips: [
      'Prima di una mossa che coinvolge altri, dì in due frasi che cosa farai: non è chiedere il permesso.',
      'Rispetta il tuo ritmo di impulso e di pausa, senza forzarti a essere costante.',
      'Usa la tua Autorità per capire se è il momento giusto, non solo se hai voglia di fare.',
      'Non spiegare ogni dettaglio: basta dare l\'informazione che serve alle persone coinvolte.',
      'Se senti rabbia, chiediti se qualcuno ti ha bloccato o se hai agito senza avvisare.',
    ],
  },
  generator: {
    id: 'generator',
    name: 'Generatore',
    summary:
      'Il Generatore ha un\'energia stabile e sostenuta che si accende quando risponde a qualcosa che lo attrae. Il suo punto di partenza è rispondere, più che iniziare a freddo.',
    description:
      'Il Generatore ha il Sacrale definito e nessun motore collegato alla Gola. È il Tipo più diffuso e, secondo il sistema, quello che "fa funzionare il mondo" quando è impegnato in ciò che lo soddisfa.\n\nLa sua aura è aperta e avvolgente: attira domande, proposte e situazioni. La Strategia è rispondere, cioè lasciare che sia la vita a porgere uno stimolo (una domanda, un invito, un\'idea) e verificare la reazione del corpo, per esempio un sì o un no immediato, un\'espansione o una chiusura.\n\nLa firma è la soddisfazione; il not-self è la frustrazione, che nasce quando ci si impegna con la testa in cose a cui il corpo non ha detto sì. A fine giornata l\'energia dovrebbe essere davvero spesa: un riposo pieno viene dopo.',
    strategy: 'Rispondere',
    signature: 'Soddisfazione',
    notSelf: 'Frustrazione',
    aura: 'Aperta e avvolgente: attira stimoli e li assorbe.',
    population: '~37%',
    tips: [
      'Trasforma le decisioni in domande sì/no e osserva la risposta del corpo.',
      'Lascia che sia la vita a proporre: aspetta di avere qualcosa a cui rispondere.',
      'Dedica la tua energia a ciò che ti dà soddisfazione, non a ciò che "dovresti" fare.',
      'Consuma l\'energia durante il giorno, così il riposo notturno è profondo.',
      'Se ti senti frustrato, controlla dove hai detto sì con la mente e il corpo diceva no.',
    ],
  },
  manifestingGenerator: {
    id: 'manifestingGenerator',
    name: 'Generatore Manifestante',
    summary:
      'Il Generatore Manifestante unisce l\'energia sacrale alla capacità di muoversi in fretta. Risponde, poi agisce veloce e informa chi è coinvolto.',
    description:
      'Ha il Sacrale definito e almeno un motore, compreso il Sacrale stesso, collegato alla Gola. Rispetto al Generatore è più rapido, versatile e incline a fare più cose insieme, anche saltando passaggi che ad altri sembrano necessari.\n\nLa Strategia è rispondere e poi informare: prima si ascolta la risposta sacrale, poi si comunica ciò che si sta per fare, in modo da evitare incomprensioni. Cambiare interesse o direzione fa parte del modo in cui questo Tipo trova la propria strada, e non è per forza incostanza.\n\nLa firma è soddisfazione (e pace); il not-self mescola frustrazione e rabbia, che compaiono quando si agisce senza risposta o senza informare. Le fonti non sono concordi sulla suddivisione in sottotipi: considerala un\'etichetta utile, non ufficiale.',
    strategy: 'Rispondere, poi informare',
    signature: 'Soddisfazione e pace',
    notSelf: 'Frustrazione e rabbia',
    aura: 'Aperta e avvolgente come quella del Generatore, ma più rapida e dinamica.',
    population: '~33%',
    tips: [
      'Ascolta prima la risposta sacrale, poi muoviti: la velocità viene dopo.',
      'Accorcia i processi e salta i passaggi inutili, ma avvisa chi dipende da te.',
      'Concediti di cambiare interesse: non devi restare in una sola specializzazione.',
      'Comunica i cambi di rotta prima che gli altri li scoprano da soli.',
      'Lascia spazio al riposo: l\'energia è tanta, ma non infinita.',
    ],
  },
  projector: {
    id: 'projector',
    name: 'Proiettore',
    summary:
      'Il Proiettore è fatto per vedere e guidare l\'energia degli altri, più che per produrla senza sosta. Per essere ascoltato bene, aspetta l\'invito giusto.',
    description:
      'Il Proiettore ha il Sacrale non definito e nessun motore collegato alla Gola. Il sistema lo descrive come una guida o un direttore: lavora al meglio quando può osservare con attenzione e indicare la strada, non quando deve eseguire a ritmo costante.\n\nLa sua aura è focalizzata e penetrante: tende a leggere l\'altro e a cogliere come funziona. La Strategia è aspettare l\'invito nelle grandi aree della vita (riconoscimento, lavoro, relazioni intime, luogo dove vivere). Aspettare non significa stare fermi: vuol dire prepararsi, coltivare competenza e farsi vedere.\n\nLa firma è il successo, cioè sentirsi riconosciuti; il not-self è l\'amarezza, che secondo la tradizione emerge quando si offre energia o consigli senza essere stati invitati e non si ricevono riconoscimento né ascolto.',
    strategy: 'Aspettare l\'invito',
    signature: 'Successo',
    notSelf: 'Amarezza',
    aura: 'Focalizzata e penetrante: legge l\'altro e ne coglie il funzionamento.',
    population: '~20%',
    tips: [
      'Riposa spesso: la tua energia è diversa da quella di un Generatore.',
      'Sviluppa pochi ambiti di competenza in cui puoi essere davvero riconosciuto.',
      'Prima di accettare un invito, verifica con la tua Autorità se è quello giusto.',
      'Evita i consigli non richiesti: spesso non vengono ascoltati.',
      'Frequenta luoghi e persone dove le tue qualità possono essere viste.',
    ],
  },
  reflector: {
    id: 'reflector',
    name: 'Riflettore',
    summary:
      'Il Riflettore ha tutti i centri aperti e funziona come uno specchio sensibile dell\'ambiente. Per le scelte importanti prende il tempo di un ciclo lunare.',
    description:
      'Il Riflettore non ha nessun centro definito, ed è il Tipo più raro. Il sistema lo descrive come un valutatore della salute di una comunità o di un luogo: assorbe ciò che c\'è attorno e lo restituisce amplificato.\n\nLa sua aura è campionatrice: assaggia l\'energia di persone e ambienti senza trattenerla. Per questo scegliere bene dove vivere e con chi stare ha un peso enorme. La Strategia è attendere un ciclo lunare completo (circa 28 giorni) prima di decisioni importanti, parlandone con persone fidate e osservando come cambia la propria percezione.\n\nLa firma è la sorpresa e il not-self è la delusione. Come per tutto il Human Design, si tratta di una chiave di lettura tradizionale e non di un fatto dimostrato scientificamente.',
    strategy: 'Aspettare un ciclo lunare',
    signature: 'Sorpresa',
    notSelf: 'Delusione',
    aura: 'Campionatrice e resistente: rispecchia l\'ambiente.',
    population: '~1%',
    tips: [
      'Per le decisioni grandi, dai a te stesso circa 28 giorni e annota come cambia il tuo sentire.',
      'Scegli con cura l\'ambiente e le persone: ti influenzano più di quanto pensi.',
      'Tieni un diario delle decisioni, per riconoscere ciò che è tuo e ciò che è assorbito.',
      'Parla con persone fidate, come cassa di risonanza e non per ricevere ordini.',
      'Concediti tempo da solo per lasciar sedimentare ciò che hai assorbito.',
    ],
  },
};
