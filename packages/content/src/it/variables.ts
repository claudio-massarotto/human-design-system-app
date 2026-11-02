import type { VariablesContent } from '../types';

export const variables: VariablesContent = {
  intro: {
    summary:
      'Le Variabili sono le quattro frecce del grafico: due a sinistra (Design) e due a destra (Personalità). Ognuna punta a sinistra o a destra e descrive un modo di assimilare o osservare il mondo.',
    description:
      'Le quattro frecce derivano da Colore e Tono di specifiche attivazioni: la Determinazione dal Sole del Design, l\'Ambiente dal Nodo Nord del Design, la Motivazione dal Sole della Personalità e la Prospettiva dal Nodo Nord della Personalità. Il Tono decide la direzione (1–3 sinistra, 4–6 destra) e il Colore la categoria.\n\nUna freccia a sinistra viene descritta come attiva, strategica e focalizzata; una a destra come recettiva, aperta e periferica. Sono immagini tradizionali, da leggere come spunti di osservazione e non come verdetti.\n\nLe Variabili sono considerate un livello avanzato: la tradizione consiglia di conoscere prima Strategia e Autorità. Richiedono un\'ora di nascita molto precisa, perché il Tono cambia nel giro di pochi minuti. I testi qui sotto non sono consigli medici o dietetici.',
  },
  determination: {
    title: 'Determinazione',
    summary:
      'In alto a sinistra: il modo in cui il corpo assimila, tradizionalmente legato alla digestione. Qui si può solo sperimentare.',
    colors: {
      1: {
        name: 'Appetito',
        summary: 'Riguarda quanto semplice o vario sia ciò che si assimila: puoi sperimentare con quantità e successione.',
        left: { name: 'Consecutivo', summary: 'Un elemento alla volta, in successione.' },
        right: { name: 'Alternato', summary: 'Alternare più elementi nello stesso momento.' },
      },
      2: {
        name: 'Gusto',
        summary: 'Riguarda la varietà e la novità di ciò che si assaggia: puoi sperimentare con il nuovo e con il familiare.',
        left: { name: 'Aperto', summary: 'Attrazione per varietà e novità.' },
        right: { name: 'Chiuso', summary: 'Preferenza per ripetere i propri favoriti.' },
      },
      3: {
        name: 'Sete',
        summary: 'Riguarda la temperatura di ciò che si assimila: puoi sperimentare con il caldo e il freddo.',
        left: { name: 'Caldo', summary: 'Sensibilità verso la temperatura calda.' },
        right: { name: 'Freddo', summary: 'Sensibilità verso la temperatura fredda.' },
      },
      4: {
        name: 'Tocco',
        summary: 'Riguarda l\'atmosfera attorno a chi assimila: puoi sperimentare con il ritmo dell\'ambiente.',
        left: { name: 'Calmo', summary: 'Spazio quieto e tranquillo.' },
        right: { name: 'Nervoso', summary: 'Contesto vivace e in movimento.' },
      },
      5: {
        name: 'Suono',
        summary: 'Riguarda i suoni attorno al momento di assimilare: puoi sperimentare con il volume.',
        left: { name: 'Alto', summary: 'Un ambiente sonoro ricco o stimolante.' },
        right: { name: 'Basso', summary: 'Silenzio o suoni discreti.' },
      },
      6: {
        name: 'Luce',
        summary: 'Riguarda l\'illuminazione del momento: puoi sperimentare con la luce e l\'ora del giorno.',
        left: { name: 'Diretta', summary: 'Luce piena, solare o intensa.' },
        right: { name: 'Indiretta', summary: 'Luce soffusa o crepuscolare.' },
      },
    },
  },
  environment: {
    title: 'Ambiente',
    summary:
      'In basso a sinistra: il tipo di luogo in cui, secondo la tradizione, ci si sente più a proprio agio.',
    colors: {
      1: {
        name: 'Grotte',
        summary: 'Luoghi di riparo e controllo, dove ci si sente al sicuro.',
        left: { name: 'Selettivo', summary: 'Spazio scelto con attenzione.' },
        right: { name: 'Mescolato', summary: 'Spazio che accoglie e mescola.' },
      },
      2: {
        name: 'Mercati',
        summary: 'Luoghi di scambio e novità, dove circolano persone e idee.',
        left: { name: 'Interno', summary: 'Scambio in spazi chiusi.' },
        right: { name: 'Esterno', summary: 'Scambio in spazi aperti.' },
      },
      3: {
        name: 'Cucine',
        summary: 'Luoghi di aggregazione e creazione, dove si prepara e si condivide.',
        left: { name: 'Umido', summary: 'Ambienti con più umidità.' },
        right: { name: 'Secco', summary: 'Ambienti più asciutti.' },
      },
      4: {
        name: 'Montagne',
        summary: 'Luoghi di distanza e panorama, da cui si osserva dall\'alto.',
        left: { name: 'Attivo', summary: 'Altura vissuta in movimento e con energia.' },
        right: { name: 'Passivo', summary: 'Altura da contemplare.' },
      },
      5: {
        name: 'Valli',
        summary: 'Luoghi di flusso e passaggio, dove circolano le informazioni.',
        left: { name: 'Stretto', summary: 'Valle racchiusa, con orizzonte ristretto.' },
        right: { name: 'Largo', summary: 'Valle ampia e aperta.' },
      },
      6: {
        name: 'Coste',
        summary: 'Luoghi di transizione, dove si incontrano mondi diversi.',
        left: { name: 'Naturale', summary: 'Costa con elementi naturali.' },
        right: { name: 'Artificiale', summary: 'Costa con elementi costruiti.' },
      },
    },
  },
  motivation: {
    title: 'Motivazione',
    summary:
      'In alto a destra: la spinta interiore che muove a fare le cose. Una chiave di riflessione, non un\'etichetta fissa.',
    colors: {
      1: {
        name: 'Paura',
        summary: 'La spinta nasce dal bisogno di sentirsi al sicuro; matura in lucidità e prudenza.',
        left: { name: 'Variante attiva', summary: 'La paura orienta in modo strategico.' },
        right: { name: 'Variante recettiva', summary: 'La paura si vive in modo più passivo.' },
      },
      2: {
        name: 'Speranza',
        summary: 'La spinta nasce dall\'attesa di qualcosa di meglio; matura in fiducia.',
        left: { name: 'Variante attiva', summary: 'La speranza orienta le scelte.' },
        right: { name: 'Variante recettiva', summary: 'La speranza si vive in attesa.' },
      },
      3: {
        name: 'Desiderio',
        summary: 'La spinta nasce dalla volontà di ottenere; matura in passione condivisa.',
        left: { name: 'Variante attiva', summary: 'Il desiderio guida l\'azione.' },
        right: { name: 'Variante recettiva', summary: 'Il desiderio si lascia scoprire.' },
      },
      4: {
        name: 'Bisogno',
        summary: 'La spinta nasce dal sentire ciò che serve; matura in cura.',
        left: { name: 'Variante attiva', summary: 'Il bisogno orienta in modo strategico.' },
        right: { name: 'Variante recettiva', summary: 'Il bisogno si ascolta.' },
      },
      5: {
        name: 'Colpa',
        summary: 'La spinta nasce dal senso di responsabilità; matura in comprensione.',
        left: { name: 'Variante attiva', summary: 'La colpa spinge a rimediare.' },
        right: { name: 'Variante recettiva', summary: 'La colpa si osserva senza agire.' },
      },
      6: {
        name: 'Innocenza',
        summary: 'La spinta nasce da una purezza di fondo; matura in presenza.',
        left: { name: 'Variante attiva', summary: 'L\'innocenza si esprime con semplicità.' },
        right: { name: 'Variante recettiva', summary: 'L\'innocenza si lascia ricevere.' },
      },
    },
  },
  perspective: {
    title: 'Prospettiva',
    summary:
      'In basso a destra: il modo in cui si guarda il mondo e si interpreta ciò che accade.',
    colors: {
      1: {
        name: 'Sopravvivenza',
        summary: 'Sguardo attento alla sicurezza e ai bisogni di base.',
        left: { name: 'Variante focalizzata', summary: 'Guarda ai dettagli della sicurezza.' },
        right: { name: 'Variante periferica', summary: 'Guarda al quadro generale della sicurezza.' },
      },
      2: {
        name: 'Possibilità',
        summary: 'Sguardo aperto a ciò che potrebbe accadere, senza legarsi a un esito.',
        left: { name: 'Variante focalizzata', summary: 'Esplora una possibilità alla volta.' },
        right: { name: 'Variante periferica', summary: 'Esplora molte possibilità insieme.' },
      },
      3: {
        name: 'Potere',
        summary: 'Sguardo attento alle dinamiche di forza e di influenza.',
        left: { name: 'Variante focalizzata', summary: 'Nota chi ha il controllo.' },
        right: { name: 'Variante periferica', summary: 'Nota gli equilibri generali.' },
      },
      4: {
        name: 'Desiderio (Wanting)',
        summary: 'Sguardo che nota ciò che manca o che si vorrebbe avere.',
        left: { name: 'Variante focalizzata', summary: 'Concentrato su ciò che manca.' },
        right: { name: 'Variante periferica', summary: 'Nota l\'insieme di ciò che si vorrebbe.' },
      },
      5: {
        name: 'Probabilità',
        summary: 'Sguardo che valuta che cosa è realistico e probabile.',
        left: { name: 'Variante focalizzata', summary: 'Valuta con attenzione singoli esiti.' },
        right: { name: 'Variante periferica', summary: 'Valuta il quadro generale.' },
      },
      6: {
        name: 'Personale',
        summary: 'Sguardo che passa dalla qualità soggettiva dell\'esperienza.',
        left: { name: 'Variante focalizzata', summary: 'Si concentra sull\'esperienza propria.' },
        right: { name: 'Variante periferica', summary: 'Si apre all\'esperienza degli altri.' },
      },
    },
  },
  tones: {
    1: { name: 'Olfatto', summary: 'Il senso dell\'odorato come canale con cui percepire.' },
    2: { name: 'Gusto', summary: 'Il senso del gusto come canale con cui percepire.' },
    3: { name: 'Visione esterna', summary: 'Lo sguardo rivolto a ciò che sta fuori.' },
    4: { name: 'Visione interna', summary: 'Lo sguardo rivolto verso l\'interno.' },
    5: { name: 'Sentire', summary: 'Il sentire come canale con cui percepire.' },
    6: { name: 'Tocco', summary: 'Il tatto come canale con cui percepire.' },
  },
};
