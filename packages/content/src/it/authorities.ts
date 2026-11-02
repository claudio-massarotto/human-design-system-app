import type { AuthorityContent } from '../types';
import type { Authority } from '@hd/core';

export const authorities: Record<Authority, AuthorityContent> = {
  emotional: {
    id: 'emotional',
    name: 'Emotiva',
    summary:
      'Con il Plesso Solare definito la chiarezza arriva nel tempo, attraverso l\'onda emotiva. Meglio non decidere a caldo.',
    description:
      'L\'Autorità Emotiva appartiene a chi ha il Plesso Solare definito. Le emozioni si muovono come un\'onda, con momenti di entusiasmo e momenti di calo; la verità di una scelta non sta in un solo punto dell\'onda, ma emerge osservandola nel tempo.\n\nIn questa autorità il Sacrale, se definito, dà una risposta immediata, ma la decisione matura dopo aver attraversato più stati d\'animo. Non c\'è bisogno di aspettare in modo rigido: conta evitare la pressione di decidere subito.\n\nÈ un\'indicazione tradizionale, da sperimentare con curiosità.',
    howTo: [
      'Se puoi, prenditi una notte o più prima di una scelta importante.',
      'Osserva come ti senti nei momenti alti e in quelli bassi rispetto alla stessa opzione.',
      'Evita di firmare o promettere quando sei molto entusiasta o molto giù.',
      'Cerca la chiarezza che resta stabile nel tempo, non l\'intensità del momento.',
    ],
  },
  sacral: {
    id: 'sacral',
    name: 'Sacrale',
    summary:
      'La risposta arriva subito, dal corpo, davanti a una domanda concreta. È un sì o un no immediato.',
    description:
      'L\'Autorità Sacrale appartiene a chi ha il Sacrale definito e il Plesso Solare non definito. Il corpo risponde in tempo reale a ciò che viene proposto: un suono, un\'attrazione, una spinta in avanti o un ritrarsi.\n\nLa risposta funziona meglio quando la domanda è semplice e posta dall\'esterno, per esempio da un\'altra persona o da te stesso in forma sì/no. La mente tende a spiegare o giustificare dopo.\n\nLa risposta non dice perché: dice solo "sì" o "no".',
    howTo: [
      'Trasforma la scelta in una domanda sì/no, da farti ad alta voce o farti fare da qualcuno.',
      'Nota la reazione immediata del corpo: espansione o contrazione, energia o spegnimento.',
      'Non spiegare subito la risposta: il corpo sa, la mente può arrivare dopo.',
      'Se la risposta è "mm", chiedi o riformula la domanda in modo più semplice.',
    ],
  },
  splenic: {
    id: 'splenic',
    name: 'Splenica',
    summary:
      'Un\'intuizione rapida e silenziosa che parla una sola volta, nel momento. Riguarda il benessere e la sicurezza.',
    description:
      'L\'Autorità Splenica appartiene a chi ha la Milza definita e né il Plesso Solare né il Sacrale definiti. È un sapere istantaneo, non ripetuto, che riguarda ciò che è sano o non sano per te.\n\nLa Milza parla piano: è un sussurro, un\'impressione, un "meglio di no". Per questo è facile coprirla con ragionamenti o paure. La tradizione dice di fidarsi del primo segnale, perché non insiste.\n\nÈ un\'indicazione che richiede attenzione al momento presente.',
    howTo: [
      'Impara a riconoscere il primo impulso, anche se è silenzioso.',
      'Non aspettare che si ripeta: spesso parla una volta sola.',
      'Distingui l\'intuizione dalla paura, che è rumorosa e ripetitiva.',
      'Annota le volte in cui hai ascoltato quel segnale e come è andata.',
    ],
  },
  egoManifested: {
    id: 'egoManifested',
    name: 'Ego manifestata',
    summary:
      'La decisione nasce da ciò che vuoi davvero e da ciò che sei disposto a impegnare, dichiarato ad alta voce.',
    description:
      'L\'Ego manifestata appartiene a chi ha il Cuore collegato alla Gola e il Plesso Solare, il Sacrale e la Milza non definiti. È tipica dei Manifestatori.\n\nLa guida è la volontà: la domanda utile è "Che cosa voglio davvero?" e "Sono disposto a mantenere questo impegno?". Dirlo a voce aiuta a sentire se la parola ha forza.\n\nLe etichette ufficiali variano tra le scuole: considerala una descrizione tradizionale.',
    howTo: [
      'Chiediti che cosa vuoi davvero, non che cosa ci si aspetta da te.',
      'Valuta se hai energia e motivazione per mantenere ciò che prometti.',
      'Dì la tua scelta ad alta voce e ascolta come suona.',
      'Informa chi è coinvolto, senza chiedere il permesso.',
    ],
  },
  egoProjected: {
    id: 'egoProjected',
    name: 'Ego proiettata',
    summary:
      'Il cuore parla mentre racconti a persone fidate che cosa desideri. La volontà si ascolta nel dialogo.',
    description:
      'L\'Ego proiettata appartiene a chi ha il Cuore collegato al centro G, la Gola non collegata a un motore e gli altri centri di autorità non definiti. È tipica dei Proiettori.\n\nLa guida è sentire che cosa si desidera davvero mentre lo si dice a qualcuno di cui ci si fida. Il volere è un impegno e non un capriccio; quando senti che lo vuoi e che lo puoi sostenere, la scelta è più solida.\n\nSi tratta di una distinzione fine; è più utile come ipotesi da verificare che come regola.',
    howTo: [
      'Parla con una persona di fiducia e ascolta ciò che dici più delle sue risposte.',
      'Chiediti se ti stai davvero impegnando o se stai cercando approvazione.',
      'Valuta se hai energia per mantenere l\'impegno senza forzarti.',
      'Ricorda l\'invito: la decisione riguarda ciò che accetti, non ciò che offri.',
    ],
  },
  selfProjected: {
    id: 'selfProjected',
    name: 'Auto-proiettata',
    summary:
      'Parlando ad alta voce con persone fidate senti qual è la tua verità. L\'identità si chiarisce nelle parole.',
    description:
      'L\'Auto-proiettata appartiene a chi ha il centro G collegato alla Gola e nessuna delle autorità precedenti. È tipica dei Proiettori.\n\nLa chiarezza non nasce dai consigli, ma dal sentire la propria voce: nel parlare emerge ciò che suona vero e ciò che suona falso. Serve un ascoltatore fidato che non ti dica che cosa fare.\n\nLe etichette variano tra le scuole: la sostanza è usare il dialogo come specchio.',
    howTo: [
      'Scegli una persona o due con cui sentirti libero di pensare ad alta voce.',
      'Racconta la scelta e ascolta il tono della tua voce, non solo i contenuti.',
      'Non cercare approvazioni: cerca la sensazione di verità mentre parli.',
      'Ripeti il confronto in momenti diversi per verificare che resti coerente.',
    ],
  },
  mental: {
    id: 'mental',
    name: 'Mentale / Ambientale',
    summary:
      'Non c\'è un\'autorità interna fissa: si decide parlando con altri in ambienti diversi e ascoltando ciò che emerge.',
    description:
      'È una forma di autorità tipica dei Proiettori che hanno definiti solo Testa, Ajna e Gola. Non esiste un centro interno che guidi la decisione: l\'ambiente e il confronto fanno da cassa di risonanza.\n\nLa guida è dialogare con più persone fidate, in luoghi diversi, e notare quale opzione resta chiara. Non si tratta di cercare consigli, ma di sentirsi parlare e di osservare dove ci si sente a proprio agio.\n\nIl nome varia tra le scuole: è anche chiamata "cassa di risonanza".',
    howTo: [
      'Parla della decisione con persone diverse, senza cercare una risposta unica.',
      'Cambia luogo: osserva come ti senti in ambienti differenti.',
      'Nota quali parole usi quando descrivi le opzioni e che cosa ti chiarisce.',
      'Concediti tempo: la chiarezza arriva dal confronto, non da un\'intuizione isolata.',
    ],
  },
  lunar: {
    id: 'lunar',
    name: 'Lunare',
    summary:
      'Per decisioni importanti il Riflettore osserva come cambia il proprio sentire nel corso di un ciclo lunare, circa 28 giorni.',
    description:
      'L\'Autorità Lunare è propria del Riflettore. Poiché tutti i centri sono aperti, il sentire cambia con l\'ambiente e con la Luna, che attraversa le 64 porte in circa 28 giorni.\n\nLa tradizione suggerisce di non decidere subito ma di vivere l\'opzione per un ciclo completo, osservando come cambia la percezione. Il confronto con persone fidate aiuta a distinguere l\'energia propria da quella assorbita.\n\nNon è una regola rigida per ogni piccola scelta, ma un metodo per le decisioni importanti.',
    howTo: [
      'Per le scelte importanti, dai un tempo di circa 28 giorni, se la situazione lo permette.',
      'Annota ogni giorno come ti senti rispetto a quell\'opzione.',
      'Parla con persone fidate in momenti diversi del ciclo.',
      'Distingui ciò che resta stabile da ciò che cambia con l\'ambiente.',
    ],
  },
};
