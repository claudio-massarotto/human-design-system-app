import { useMemo, useState } from 'react';
import { computePenta, type Chart } from '@hd/core';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { useCharts, useSettings } from '../data/hooks';
import { groupRepository } from '../data/repositories';
import type { SavedGroup } from '../data/types';
import { useEngine } from '../lib/engine';
import { usePageTitle } from '../lib/usePageTitle';

export function Component() {
  const { t } = useTranslation('groups');
  usePageTitle(t('title'));
  const { charts } = useCharts();
  const savedGroups = useLiveQuery(() => groupRepository.list(), []) ?? [];
  const engine = useEngine();
  const { settings } = useSettings();
  const computed = useMemo(() => new Map(charts.map((person) => {
    try { return [person.id, engine.computeChart(person.birth, { node: settings.node })] as const; }
    catch { return [person.id, null] as const; }
  })), [charts, engine, settings.node]);
  const [selected, setSelected] = useState<SavedGroup | null>(null);
  const [name, setName] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [memberOverrides, setMemberOverrides] = useState<Record<string, string[]>>({});
  const [editing, setEditing] = useState(false);
  const startNew = () => { setSelected(null); setName(''); setMemberIds([]); setEditing(true); };
  const edit = (group: SavedGroup) => { setSelected(group); setName(group.name); setMemberIds(group.memberIds); setEditing(true); };
  async function save() {
    if (!name.trim()) return;
    const now = new Date().toISOString();
    await groupRepository.save({ id: selected?.id ?? crypto.randomUUID(), name: name.trim(), memberIds, createdAt: selected?.createdAt ?? now, updatedAt: now });
    setEditing(false);
  }
  return <div>
    <PageHeader title={t('title')} subtitle={t('subtitle')} actions={<Button onClick={startNew}>{t('new')}</Button>} />
    {editing && <Card className="mb-5 space-y-4">
      <label className="block text-sm font-medium">{t('name')}<Input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} /></label>
      <fieldset className="space-y-2"><legend className="mb-2 text-sm font-semibold">{t('members')}</legend>{charts.map((person) => <label key={person.id} className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={memberIds.includes(person.id)} onChange={() => setMemberIds((ids) => ids.includes(person.id) ? ids.filter((id) => id !== person.id) : [...ids, person.id])} />{person.name}</label>)}</fieldset>
      <div className="flex gap-2"><Button onClick={() => void save()} disabled={!name.trim()}>{t('save')}</Button><Button variant="secondary" onClick={() => setEditing(false)}>{t('cancel')}</Button></div>
    </Card>}
    {savedGroups.length === 0 && !editing && <p className="text-muted">{t('empty')}</p>}
    <div className="space-y-4">{savedGroups.map((group) => {
      const ids = (memberOverrides[group.id] ?? group.memberIds).filter((id) => charts.some((chart) => chart.id === id));
      const members = charts.filter((chart) => ids.includes(chart.id));
      const analyses = members.map((person) => computed.get(person.id)).filter((chart): chart is Chart => chart !== null && chart !== undefined);
      const analysis = analyses.length ? computePenta(analyses) : null;
      const indexNames = analyses.map((_, index) => members[index]?.name ?? '');
      return <Card key={group.id} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-display text-2xl">{group.name}</h2><div className="flex gap-2"><Button variant="secondary" onClick={() => edit(group)}>{t('edit')}</Button><Button variant="secondary" onClick={() => { if (confirm(t('deleteConfirm', { name: group.name }))) void groupRepository.remove(group.id); }}>{t('delete')}</Button></div></div>
        <fieldset><legend className="mb-2 text-sm font-semibold">{t('included', { count: members.length })}</legend><div className="grid gap-2 sm:grid-cols-2">{charts.map((person) => <label key={person.id} className="flex min-h-11 items-center gap-3 rounded-lg bg-surface-2 px-3"><input type="checkbox" checked={ids.includes(person.id)} onChange={() => { const next = ids.includes(person.id) ? ids.filter((id) => id !== person.id) : [...new Set([...ids, person.id])]; setMemberOverrides((state) => ({ ...state, [group.id]: next })); void groupRepository.save({ ...group, memberIds: next, updatedAt: new Date().toISOString() }); }} />{person.name}</label>)}</div></fieldset>
        {members.length > 5 ? <p className="rounded-xl bg-surface-2 p-3 text-sm text-muted">{t('overFive')}</p> : members.length < 3 ? <p className="rounded-xl bg-surface-2 p-3 text-sm text-muted">{t('rangeNote')}</p> : analysis ? <>
          {!analysis.withinPentaRange && <p className="text-sm text-muted">{t('rangeNote')}</p>}
          <h3 className="font-semibold">{t('gates')}</h3><ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">{analysis.gates.map(({ gate, members: indexes }) => <li key={gate} className="rounded-xl bg-surface-2 p-3"><strong>{gate}</strong> <span className="text-muted">{indexes.length ? [...new Set(indexes.map((i) => indexNames[Number(i)]))].join(', ') : t('gap')}</span></li>)}</ul>
          <h3 className="font-semibold">{t('channels')}</h3><ul className="grid gap-2 sm:grid-cols-2">{analysis.channels.map((channel) => <li key={channel.id} className="rounded-xl bg-surface-2 p-3"><strong>{channel.gates.join('–')}</strong> · {channel.covered ? t('covered') : t('gap')} <span className="text-muted">· {t(`role.${channel.role}`)}</span></li>)}</ul>
          <h3 className="font-semibold">{t('roles')}</h3><p className="text-sm text-muted">{analysis.roles.map((role) => `${t(`role.${role.role}`)}: ${[...new Set(role.members.map((i) => indexNames[Number(i)]))].join(', ')}`).join(' · ') || t('noRoles')}</p>
        </> : <p className="text-sm text-muted">{t('needCharts')}</p>}
      </Card>;
    })}</div>
  </div>;
}
