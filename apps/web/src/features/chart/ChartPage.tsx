import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { exportPng, type Selection } from '@hd/bodygraph';
import type { Chart } from '@hd/core';
import { useChartView } from '../../components/ChartViewToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { LinkButton } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from '../../components/ui/Toast';
import { InfoIcon, PeopleIcon, WarningIcon } from '../../components/icons';
import { setPrimaryChart } from '../../data/actions';
import { useSettings } from '../../data/hooks';
import { useEngine } from '../../lib/engine';
import type { SavedChart } from '../../data/types';
import { useContent } from '../../i18n/useContent';
import { downloadBlob } from '../../lib/download';
import type { SharePayload } from '../../lib/share';
import { appUrl } from '../../components/ShareButton';
import { usePageTitle } from '../../lib/usePageTitle';
import { BodygraphHero } from './BodygraphHero';
import type { ChartSide } from './sides';
import { ChartHeader } from './ChartHeader';
import { DetailSheet } from './DetailSheet';
import { NextHoursCard } from './NextHoursCard';
import { SummaryCards } from './SummaryCards';
import { TimeAccuracy } from './TimeAccuracy';
import { PlanetaryReturns } from './PlanetaryReturns';
import { useLoadedChart } from './hooks';
import { safeFileName, type DetailTarget } from './lib';
import { ActivationsTab } from './tabs/ActivationsTab';
import { CentersTab } from './tabs/CentersTab';
import { ChannelsTab } from './tabs/ChannelsTab';
import { CrossTab } from './tabs/CrossTab';
import { SidesTab } from './tabs/SidesTab';
import { VariablesTab } from './tabs/VariablesTab';

const TAB_KEYS = ['activations', 'centers', 'channels', 'sides', 'variables', 'cross'] as const;
type TabKey = (typeof TAB_KEYS)[number];

function selectionOf(detail: DetailTarget | null): Selection | null {
  if (!detail) return null;
  if (detail.kind === 'gate') return { kind: 'gate', gate: detail.gate };
  if (detail.kind === 'channel') return { kind: 'channel', id: detail.id };
  if (detail.kind === 'center') return { kind: 'center', id: detail.id };
  return null;
}

function ChartView({ saved, chart }: { saved: SavedChart; chart: Chart }) {
  const { t } = useTranslation('chart');
  const content = useContent();
  const { settings } = useSettings();
  const engine = useEngine();
  const boxRef = useRef<HTMLDivElement>(null);
  const [detail, setDetail] = useState<DetailTarget | null>(null);
  const [tab, setTab] = useState<TabKey>('activations');
  const [exporting, setExporting] = useState(false);
  const [view, setView] = useChartView();
  // Il lato non si ricorda: aprendo un chart si vede sempre il chart intero.
  const [side, setSide] = useState<ChartSide>('both');
  const selected = useMemo(() => selectionOf(detail), [detail]);

  async function onExport() {
    const svg = boxRef.current?.querySelector('svg');
    if (!svg) return;
    setExporting(true);
    try {
      const blob = await exportPng(svg as SVGSVGElement, 2);
      const file = `${safeFileName(saved.name)}-${view}${side === 'both' ? '' : `-${side}`}.png`;
      downloadBlob(blob, file);
      toast(t('toast.exported', { file }));
    } catch {
      toast(t('toast.exportError'), 'error');
    } finally {
      setExporting(false);
    }
  }

  async function buildShare(): Promise<SharePayload | null> {
    const svg = boxRef.current?.querySelector('svg');
    if (!svg) return null;
    const blob = await exportPng(svg as SVGSVGElement, 2);
    const name = `${safeFileName(saved.name)}-${view}${side === 'both' ? '' : `-${side}`}.png`;
    const type = content.types[chart.type]?.name ?? '';
    return {
      title: saved.name,
      text: t('share.text', { name: saved.name, type, profile: chart.profile.id }),
      url: appUrl(),
      file: new File([blob], name, { type: 'image/png' }),
    };
  }

  async function onSetPrimary() {
    try {
      await setPrimaryChart(saved.id);
      toast(t('toast.primary', { name: saved.name }));
    } catch {
      toast(t('toast.primaryError'), 'error');
    }
  }

  return (
    <div>
      <ChartHeader
        saved={saved}
        chart={chart}
        isPrimary={settings.primaryChartId === saved.id}
        exporting={exporting}
        onSetPrimary={onSetPrimary}
        onExport={onExport}
        buildShare={buildShare}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-12">
        <BodygraphHero
          chart={chart}
          name={saved.name}
          view={view}
          onViewChange={setView}
          side={side}
          onSideChange={setSide}
          selected={selected}
          onSelect={(sel) => setDetail(sel)}
          svgBoxRef={boxRef}
        />
        <div className="flex flex-col gap-5">
          <SummaryCards chart={chart} onOpen={setDetail} />
          <NextHoursCard chart={chart} />
          <TimeAccuracy chart={chart} birth={saved.birth} />
        </div>
      </div>

      <PlanetaryReturns chart={chart} engine={engine} chartId={saved.id} />

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        aria-label={t('tabs.label')}
        className="mt-10 lg:mt-14"
      >
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList aria-label={t('tabs.label')}>
            {TAB_KEYS.map((k) => (
              <TabsTrigger key={k} value={k} className="px-3 sm:px-4">
                {t(`tabs.${k}`)}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="activations">
            <ActivationsTab chart={chart} onOpen={setDetail} />
          </TabsContent>
          <TabsContent value="centers">
            <CentersTab chart={chart} onOpen={setDetail} />
          </TabsContent>
          <TabsContent value="channels">
            <ChannelsTab chart={chart} onOpen={setDetail} />
          </TabsContent>
          <TabsContent value="sides">
            <SidesTab chart={chart} name={saved.name} onOpen={setDetail} />
          </TabsContent>
          <TabsContent value="variables">
            <VariablesTab chart={chart} />
          </TabsContent>
          <TabsContent value="cross">
            <CrossTab chart={chart} onOpen={setDetail} />
          </TabsContent>
        </Tabs>
      </motion.section>

      <p className="mt-10 flex gap-2 text-[12.5px] leading-snug text-muted">
        <InfoIcon size={15} className="mt-0.5 shrink-0" />
        <span>{content.disclaimer}</span>
      </p>

      <DetailSheet
        target={detail}
        chart={chart}
        onOpenChange={(open) => !open && setDetail(null)}
        onNavigate={setDetail}
      />
    </div>
  );
}

export function ChartPage() {
  const { id } = useParams();
  const { t } = useTranslation('chart');
  const { saved, chart, error, loading } = useLoadedChart(id);
  usePageTitle(saved?.name);

  if (loading) return <Spinner className="mx-auto mt-24" />;
  if (!saved) {
    return (
      <EmptyState
        icon={<PeopleIcon size={26} />}
        title={t('notFound.title')}
        description={t('notFound.description')}
        action={<LinkButton to="/persone">{t('notFound.action')}</LinkButton>}
      />
    );
  }
  if (!chart || error) {
    return (
      <EmptyState
        icon={<WarningIcon size={26} />}
        title={t('loadError.title')}
        description={t('loadError.description')}
        action={<LinkButton to={`/persone/${saved.id}/modifica`}>{t('actions.edit')}</LinkButton>}
      />
    );
  }
  return <ChartView saved={saved} chart={chart} />;
}
