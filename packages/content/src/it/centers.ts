import type { CenterContent } from '../types';
import type { CenterId } from '@hd/core';

export const centers: Record<CenterId, CenterContent> = {
  head: {
    id: 'head',
    name: 'Testa',
    kind: 'Pressione',
    theme: 'Ispirazione e domande',
    biology: 'Nel sistema è associato simbolicamente alla ghiandola pineale.',
    summary: 'Il centro delle domande e dell’ispirazione: spinge la mente a chiedersi “perché?”.',
    description:
      'La Testa è un centro di pressione con tre porte (64, 61, 63): trasforma la curiosità in una spinta a pensare, dubitare e cercare risposte. Non fornisce le risposte, ma il carburante che mette in moto l’Ajna.\n\nChi ha la Testa definita vive un flusso costante di domande e ispirazioni, a volte difficile da spegnere. Se è indefinita o aperta, tende ad assorbire le domande altrui e a sentirsi in dovere di risolvere anche ciò che non la riguarda.',
    defined:
      'Un flusso stabile di domande e ispirazioni, con una mente che raramente è ferma. Ha un modo proprio di essere curiosa, ma può faticare a lasciar andare i pensieri.',
    undefined:
      'Alcune porte sono attive: ci sono temi ricorrenti di dubbio o ispirazione, ma senza costanza. Si tende a cercare qualcuno che completi la porta, e a sentire la pressione di rispondere.',
    open:
      'Nessuna porta attiva: la mente assorbe volentieri le domande degli altri, con il rischio di confondere ispirazione propria e altrui. Se non si vive sotto pressione, diventa un’ottima capacità di scegliere le domande che contano.',
    notSelfQuestion: 'Devo davvero trovare una risposta a tutte queste domande?',
    wisdom: 'Distinguere quali domande meritano attenzione e lasciar cadere le altre.',
  },
  ajna: {
    id: 'ajna',
    name: 'Ajna',
    kind: 'Consapevolezza',
    theme: 'Concettualizzare e dare forma ai pensieri',
    biology: 'Nel sistema è associato simbolicamente all’ipofisi.',
    summary: 'Il centro che elabora le idee, le organizza e le trasforma in concetti.',
    description:
      'L’Ajna è un centro di consapevolezza mentale con sei porte (47, 24, 4, 17, 43, 11). Non misura l’intelligenza: descrive il modo in cui la mente analizza, organizza e arriva a una conclusione.\n\nSe è definita, il modo di pensare è coerente e riconoscibile, con opinioni stabili. Se è indefinita o aperta, la mente è flessibile e sa guardare da più prospettive, ma può sentire il bisogno di apparire sicura.',
    defined:
      'Un modo di pensare fisso e affidabile, con un proprio metodo per comprendere. Le opinioni sono stabili e talvolta difficili da cambiare.',
    undefined:
      'Alcune porte sono attive, quindi alcuni temi mentali sono costanti, mentre altri variano con le persone che si incontrano. Può essere utile confrontarsi con chi completa le porte mancanti.',
    open:
      'La mente prova molti punti di vista senza fissarsi su uno. Il dono è la prospettiva ampia; la sfida è non fingere certezze per sentirsi adeguati.',
    notSelfQuestion: 'Devo sembrare sicuro di ciò che penso?',
    wisdom: 'Tenere aperte più prospettive e non aggrapparsi a una certezza.',
  },
  throat: {
    id: 'throat',
    name: 'Gola',
    kind: 'Manifestazione',
    theme: 'Espressione, parola e azione',
    biology: 'Nel sistema è associato simbolicamente alla tiroide.',
    summary: 'Il centro dell’espressione: ciò che si pensa, si sente e si decide diventa parola o azione.',
    description:
      'La Gola ha undici porte (62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16), più di ogni altro centro, perché è il luogo in cui tutto si manifesta. Ciò che esprime dipende dai centri collegati: una Gola unita al Sacrale, per esempio, parla in modo diverso da una unita al Plesso Solare.\n\nSe è definita, la voce ha uno stile costante e riconoscibile. Se è indefinita o aperta, varia con il contesto e può sentire la spinta a parlare per farsi notare.',
    defined:
      'Uno stile di comunicazione stabile, che gli altri riconoscono. Il modo di esprimersi è affidabile, anche se non sempre adatto a ogni contesto.',
    undefined:
      'Alcune porte sono attive: certe cose si dicono con facilità, altre dipendono dal momento e dalle persone. Aspettare di essere ascoltati rende la voce più efficace.',
    open:
      'La voce cambia e amplifica ciò che incontra. La sfida è non parlare per forza; il dono è dire la cosa giusta nel momento giusto.',
    notSelfQuestion: 'Devo parlare o fare qualcosa per essere notato?',
    wisdom: 'Parlare al momento giusto, con voce autentica e senza sforzo.',
  },
  g: {
    id: 'g',
    name: 'G',
    kind: 'Identità',
    theme: 'Identità, direzione e amore',
    biology: 'Nel sistema è associato simbolicamente al fegato e alla circolazione.',
    summary: 'Il centro del senso di sé, della direzione nella vita e dell’amore.',
    description:
      'Il centro G ha otto porte (1, 13, 25, 46, 2, 15, 10, 7) e si occupa di identità, direzione e amore. Agisce come un “magnete” che attira persone e luoghi in sintonia con la propria rotta.\n\nSe è definito, l’identità è stabile e riconoscibile; chi ha il G aperto ne sente l’influenza. Se è indefinito o aperto, il senso di sé varia con l’ambiente: il luogo e le persone giuste diventano particolarmente importanti.',
    defined:
      'Un’identità e una direzione coerenti nel tempo. Si porta con sé un senso di sé che gli altri percepiscono.',
    undefined:
      'Alcune porte sono attive: ci sono tratti stabili d’identità o direzione, ma il resto dipende dal contesto. Ambiente e compagnia incidono molto.',
    open:
      'L’identità è fluida e si adatta a luoghi e persone. Il dono è la capacità di cogliere gli ambienti giusti; la sfida è non cercare fuori chi essere.',
    notSelfQuestion: 'Chi sono e dove devo andare? Dove posso essere amato?',
    wisdom: 'Fluidità nell’identità e capacità di riconoscere i luoghi e le persone giuste.',
  },
  heart: {
    id: 'heart',
    name: 'Cuore',
    kind: 'Motore',
    theme: 'Volontà, valore personale e promesse',
    biology: 'Nel sistema è associato simbolicamente al cuore, allo stomaco e al timo.',
    summary: 'Il centro della volontà e del valore personale: parla di impegni, risorse e promesse.',
    description:
      'Il Cuore (o centro dell’Ego) ha quattro porte (21, 40, 26, 51) e porta energia di volontà, ma a scatti, non in modo continuo. Si occupa di ciò che si promette, di cosa si ritiene di valere e di come ci si impegna materialmente.\n\nSe è definito, la forza di volontà è affidabile e le promesse vengono mantenute, a patto di riposare. Se è indefinito o aperto, c’è la tendenza a dimostrare il proprio valore e a promettere troppo.',
    defined:
      'Una volontà affidabile: ciò che si promette, in genere, si mantiene. Servono periodi di riposo, perché l’energia non è continua.',
    undefined:
      'Alcune porte sono attive: in certi ambiti si ha volontà propria, in altri dipende dal contesto. È utile non fare promesse se non si è sicuri di poterle mantenere.',
    open:
      'Non c’è bisogno di dimostrare nulla. La sfida è non sovraccaricarsi per essere accettati; il dono è un senso del valore che non dipende dalle prestazioni.',
    notSelfQuestion: 'Devo dimostrare quanto valgo?',
    wisdom: 'Sapere che il proprio valore non va dimostrato e scegliere cosa si può davvero mantenere.',
  },
  sacral: {
    id: 'sacral',
    name: 'Sacrale',
    kind: 'Motore',
    theme: 'Forza vitale, lavoro e risposta',
    biology: 'Nel sistema è associato simbolicamente agli organi della riproduzione.',
    summary: 'Il centro della forza vitale: dà energia per lavorare e risponde a ciò che la vita propone.',
    description:
      'Il Sacrale ha nove porte (34, 5, 14, 29, 59, 9, 3, 42, 27) ed è il motore principale dei Generatori. Governa la capacità di lavorare, di sostenere uno sforzo e di rispondere con un “sì” o un “no” viscerale.\n\nSe è definito, l’energia è rinnovabile quando si fa ciò che dà soddisfazione. Se è indefinito o aperto, assorbe l’energia altrui e rende difficile capire quando è abbastanza.',
    defined:
      'Una riserva di energia costante, che si rinnova con il riposo e con il lavoro soddisfacente. La risposta sacrale è la bussola per decidere.',
    undefined:
      'Alcune porte sono attive: l’energia c’è in certi ambiti, ma non è sempre disponibile. Conviene ascoltare il corpo e non seguire il ritmo degli altri.',
    open:
      'Non c’è una riserva costante: si amplifica l’energia di chi sta intorno. La sfida è fermarsi in tempo; il dono è una grande sensibilità a ciò che è sostenibile.',
    notSelfQuestion: 'Quando posso smettere? Quanto è abbastanza?',
    wisdom: 'Sapere quando basta e riposare davvero.',
  },
  solarPlexus: {
    id: 'solarPlexus',
    name: 'Plesso Solare',
    kind: 'Motore e consapevolezza',
    theme: 'Emozioni, desideri e onda emotiva',
    biology: 'Nel sistema è associato simbolicamente al sistema nervoso e ad alcuni organi addominali.',
    summary: 'Il centro delle emozioni: vive a onde e invita a prendersi tempo prima di decidere.',
    description:
      'Il Plesso Solare ha sette porte (6, 37, 22, 36, 30, 55, 49) ed è il centro di consapevolezza più lento. Le emozioni salgono e scendono in un’onda: la chiarezza arriva dopo che l’onda si è calmata.\n\nSe è definito, l’onda emotiva è parte del carattere e diventa un’autorità interiore. Se è indefinito o aperto, assorbe e amplifica le emozioni altrui, con la tentazione di evitare il conflitto.',
    defined:
      'Un’onda emotiva propria, che sale e scende nel tempo. Decidere dopo aver atteso chiarezza è la strada più sicura.',
    undefined:
      'Alcune porte sono attive: certe sensibilità emotive sono costanti, il resto dipende dal clima intorno. Può essere difficile distinguere le proprie emozioni.',
    open:
      'Le emozioni altrui passano e si amplificano. La sfida è non evitare i confronti; il dono è una profonda comprensione emotiva, se si impara a distinguere ciò che è proprio.',
    notSelfQuestion: 'Devo evitare il conflitto e la verità emotiva?',
    wisdom: 'Distinguere le emozioni proprie da quelle assorbite e restare sereni accanto ad esse.',
  },
  spleen: {
    id: 'spleen',
    name: 'Milza',
    kind: 'Consapevolezza',
    theme: 'Istinto, intuizione e salute',
    biology: 'Nel sistema è associato simbolicamente alla milza e al sistema immunitario.',
    summary: 'Il centro dell’istinto: una percezione immediata di ciò che è sano o no, che parla una sola volta.',
    description:
      'La Milza ha sette porte (48, 57, 44, 50, 32, 28, 18) ed è il centro di consapevolezza più antico. Dà un’intuizione spontanea, legata alla sopravvivenza, alla salute e alla paura, che compare nell’istante e non si ripete.\n\nSe è definita, l’intuito è costante e affidabile. Se è indefinita o aperta, si può tendere a trattenere persone o situazioni non sane, per timore di perdere sicurezza.',
    defined:
      'Un’intuizione costante, che segnala subito ciò che fa bene o male. Il segnale è sottile: va ascoltato quando arriva.',
    undefined:
      'Alcune porte sono attive: l’istinto funziona in certi ambiti, mentre in altri è influenzato dal contesto. Prendersi tempo può aiutare a riconoscere il segnale.',
    open:
      'Si assorbono paure e abitudini altrui. La sfida è lasciare andare ciò che non fa bene; il dono è un senso fine di cosa sia sano.',
    notSelfQuestion: 'Devo tenere ancora questo, anche se non mi fa bene?',
    wisdom: 'Saper lasciare andare e riconoscere ciò che è sano per sé e per gli altri.',
  },
  root: {
    id: 'root',
    name: 'Radice',
    kind: 'Motore e pressione',
    theme: 'Pressione, stress e impulso ad agire',
    biology: 'Nel sistema è associato simbolicamente alle ghiandole surrenali.',
    summary: 'Il centro della pressione e dello stress: dà la spinta per iniziare e portare a termine.',
    description:
      'La Radice ha nove porte (53, 60, 52, 19, 39, 41, 58, 38, 54) ed è insieme motore e fonte di pressione. Determina come si vive lo stress, l’urgenza e l’impulso evolutivo, e fornisce l’adrenalina di base per agire.\n\nSe è definita, il ritmo tra pressione e rilascio è stabile. Se è indefinita o aperta, si sente la pressione degli altri e la fretta di liberarsene.',
    defined:
      'Un ritmo costante di pressione e rilascio. Lo stress si gestisce con una certa stabilità, a patto di riconoscere i propri tempi.',
    undefined:
      'Alcune porte sono attive: in certi ambiti si ha un ritmo proprio, in altri si risente della pressione esterna. Conviene non partire dalla fretta.',
    open:
      'Si assorbe la pressione di chi sta intorno e si tende ad accelerare. Il dono è la calma sotto pressione, quando si impara a non lasciarsi trascinare.',
    notSelfQuestion: 'Devo sbrigarmi per togliermi questa pressione di dosso?',
    wisdom: 'Rallentare e lasciar andare la pressione: la calma come dono.',
  },
};
