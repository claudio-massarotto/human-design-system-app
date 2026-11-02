import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '../components/ui/Toast';
import { defaultRepos } from '../data/actions';
import { MAX_BACKUP_BYTES, applyBackup, parseBackup } from '../data/backup';

/** Importa un file di backup JSON validandolo; mostra l'esito con un toast. */
export function useBackupImport() {
  const { t } = useTranslation('people');
  const importFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_BACKUP_BYTES) {
        toast(t('import.tooLarge'), 'error');
        return;
      }
      const result = parseBackup(await file.text());
      if (!result.ok) {
        const e = result.error;
        toast(
          t(`import.error.${e.code}`, { n: e.code === 'invalidChart' ? e.index + 1 : 0 }),
          'error',
        );
        return;
      }
      try {
        const s = await applyBackup(result.backup, defaultRepos);
        toast(t('import.done', { added: s.added, updated: s.updated, skipped: s.skipped }));
      } catch {
        toast(t('import.writeError'), 'error');
      }
    },
    [t],
  );
  return { importFile };
}
