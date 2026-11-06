import { useCallback, useState } from 'react';
import { PATHS_STORAGE_KEY, readProgress, writeProgress, type PathProgress } from './learning';

/** Progresso dei percorsi, ricordato su questo dispositivo (localStorage). */
export function useLearningProgress(): {
  progress: PathProgress;
  markDone(pathId: string, lessonId: string): void;
  reset(pathId: string): void;
} {
  const [progress, setProgress] = useState<PathProgress>(readProgress);

  const commit = useCallback((update: (p: PathProgress) => PathProgress) => {
    // Rilegge lo storage: più schede o più pagine non si sovrascrivono a vicenda.
    const next = update(readProgress());
    writeProgress(next);
    setProgress(next);
  }, []);

  const markDone = useCallback(
    (pathId: string, lessonId: string) =>
      commit((p) =>
        (p[pathId] ?? []).includes(lessonId)
          ? p
          : { ...p, [pathId]: [...(p[pathId] ?? []), lessonId] },
      ),
    [commit],
  );
  const reset = useCallback(
    (pathId: string) =>
      commit((p) => {
        const { [pathId]: _removed, ...rest } = p;
        return rest;
      }),
    [commit],
  );
  return { progress, markDone, reset };
}

export { PATHS_STORAGE_KEY };
