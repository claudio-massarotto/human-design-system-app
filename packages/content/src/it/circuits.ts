import type { CircuitContent } from '../types';
import type { CircuitId } from '@hd/core';

export const circuits: Record<CircuitId, CircuitContent> = {
  individualKnowing: {
    id: 'individualKnowing',
    name: 'Individuale · Conoscenza',
    keywords: ['unicità', 'intuizione', 'mutazione', 'espressione'],
    summary: 'Il circuito dell’unicità: una conoscenza intuitiva che non ha bisogno di spiegazioni.',
    description:
      'Fa parte del circuito Individuale ed è formato da nove canali (1-8, 2-14, 3-60, 12-22, 20-57, 23-43, 24-61, 28-38, 39-55). Il tema è l’innovazione che nasce dalla propria unicità, sentita più che dimostrata.\n\nChi ha molti canali di questo tipo tende a seguire la propria strada e a ispirare per esempio, non per istruzione. La sfida è farsi capire senza snaturarsi, rispettando il tempo con cui le idee maturano.',
  },
  individualCentering: {
    id: 'individualCentering',
    name: 'Individuale · Centratura',
    keywords: ['centratura', 'autenticità', 'iniziativa', 'amore di sé'],
    summary: 'Il circuito della centratura: vivere dalla propria autenticità e dall’amore di sé.',
    description:
      'È il gruppo più piccolo del circuito Individuale, con due soli canali (10-34, 25-51). Collega il centro G a un motore (Sacrale e Cuore), e tratta di agire secondo il proprio sé e il proprio coraggio.\n\nIl tema è l’iniziativa autentica: avviare, esplorare e fare il primo passo. La sfida è distinguere ciò che nasce dalla propria direzione da ciò che serve solo a dimostrare qualcosa.',
  },
  integration: {
    id: 'integration',
    name: 'Integrazione',
    keywords: ['presente', 'sopravvivenza', 'autonomia', 'esempio'],
    summary: 'Il circuito dell’integrazione: vivere in modo allineato al proprio corpo nel presente.',
    description:
      'È un gruppo di quattro canali (10-20, 10-57, 20-34, 34-57) tra le porte 10, 20, 34 e 57. Il tema è la sopravvivenza nel presente, con un comportamento coerente e istintivo.\n\nChi ne ha è spinto a vivere con autonomia e ad ascoltare il corpo nel qui e ora. L’influenza sugli altri avviene soprattutto con l’esempio.',
  },
  collectiveLogic: {
    id: 'collectiveLogic',
    name: 'Collettivo · Logico',
    keywords: ['schemi', 'futuro', 'miglioramento', 'condivisione'],
    summary: 'Il circuito della logica: cerca schemi e verifiche per migliorare il futuro del gruppo.',
    description:
      'È il sotto-circuito del Collettivo che guarda avanti, con sette canali (4-63, 5-15, 7-31, 9-52, 16-48, 17-62, 18-58). Si basa su schemi, esperimenti e verifiche per prevedere ciò che funzionerà.\n\nIl tema è condividere ciò che è stato messo alla prova. Il rischio è la critica rivolta a tutto; il dono è far evolvere il gruppo con soluzioni testate.',
  },
  collectiveAbstract: {
    id: 'collectiveAbstract',
    name: 'Collettivo · Astratto',
    keywords: ['esperienza', 'memoria', 'condivisione', 'racconto'],
    summary: 'Il circuito dell’astratto: trae lezioni dall’esperienza e le condivide con gli altri.',
    description:
      'È il sotto-circuito del Collettivo che guarda al passato, con sette canali (11-56, 13-33, 29-46, 30-41, 35-36, 42-53, 47-64). Ha a che fare con l’esperienza, la memoria e i sentimenti.\n\nIl tema è raccontare e condividere ciò che si è vissuto, per trasmettere saggezza. La sfida è lasciar maturare le esperienze prima di trarne una lezione.',
  },
  tribalEgo: {
    id: 'tribalEgo',
    name: 'Tribale · Ego',
    keywords: ['lealtà', 'risorse', 'patto', 'sostegno'],
    summary: 'Il circuito dell’ego tribale: patti di lealtà, risorse e sostegno reciproco.',
    description:
      'È il sotto-circuito del Tribale legato a volontà e risorse, con cinque canali (19-49, 21-45, 26-44, 32-54, 37-40). Tutti passano dal Cuore o dal Plesso Solare e parlano di impegno materiale.\n\nIl tema è il sostegno reciproco nella comunità: dare e ricevere in modo equo. La sfida è non confondere il sostegno con il controllo.',
  },
  tribalDefense: {
    id: 'tribalDefense',
    name: 'Tribale · Difesa',
    keywords: ['protezione', 'intimità', 'cura', 'continuità'],
    summary: 'Il circuito della difesa: custodire legami e continuità di vita nella comunità.',
    description:
      'È il sotto-circuito più piccolo del Tribale, con due canali (6-59, 27-50). Entrambi passano dal Sacrale e riguardano la protezione e la prosecuzione della vita: intimità e cura.\n\nIl tema è custodire ciò che è fragile e importante. La sfida è non dimenticare i propri limiti nel prendersi cura degli altri.',
  },
};
