import { Column, Pie } from '@ant-design/charts'
import { BarChart3, ClipboardCheck } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { coordinatorTrendSeriesColors  } from '@/features/dashboard/qa-coordinator/helpers/qa-coordinator-dashboard'
import type {CategorySlice} from '@/features/dashboard/qa-coordinator/helpers/qa-coordinator-dashboard';

interface QACoordinatorChartsSectionProps {
  error?: Error | null
  ideasCount: number
  trendChartData: Array<{ month: string; series: 'Ideas' | 'Comments'; value: number }>
  categoryDistribution: CategorySlice[]
  categoryChartData: Array<{ type: string; value: number; color: string }>
}

export function QACoordinatorChartsSection({ error, ideasCount, trendChartData, categoryDistribution, categoryChartData }: QACoordinatorChartsSectionProps) {
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <SectionCard title="Ideas & comments trend" description="Recent department activity across the last five months.">
        {error ? <EmptyState icon={BarChart3} title="Trend data unavailable" description={error.message} /> : ideasCount > 0 ? (
          <div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <Column data={trendChartData} xField="month" yField="value" seriesField="series" group colorField="series" color={[coordinatorTrendSeriesColors.Ideas, coordinatorTrendSeriesColors.Comments]} height={288} marginLeft={36} marginTop={28} marginBottom={40} paddingBottom={12} axis={{ x: { title: false, tick: false, labelAutoHide: false, line: true, lineStroke: '#cbd5e1', labelFill: '#64748b' }, y: { title: false, tick: false, gridLine: true, gridStroke: '#e2e8f0', labelFill: '#94a3b8' } }} legend={false} label={{ text: 'value', position: 'top', dy: -14, style: { fill: '#0f172a', fontSize: 12, fontWeight: 700 } }} interaction={{ elementHighlight: false }} tooltip={{ title: 'month' }} />
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />Ideas</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Comments</span>
            </div>
          </div>
        ) : <EmptyState icon={BarChart3} title="No trend data yet" description="Activity charts will appear as soon as your department receives ideas." />}
      </SectionCard>

      <SectionCard title="Ideas by category" description="Distribution of department ideas across the most active themes.">
        {error ? <EmptyState icon={ClipboardCheck} title="Category breakdown unavailable" description={error.message} /> : categoryDistribution.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="flex items-center justify-center">
              <div className="h-60 w-full max-w-[280px] rounded-[24px] border border-slate-200 bg-slate-50/70 p-3">
                <Pie data={categoryChartData} angleField="value" colorField="type" height={216} innerRadius={0.58} radius={0.9} padding={0} legend={false} tooltip={{ items: [(datum) => ({ name: datum.type, value: `${datum.value} ideas`, color: datum.color })] }} label={false} color={categoryChartData.map((slice) => slice.color)} style={{ stroke: '#ffffff', lineWidth: 1 }} />
              </div>
            </div>
            <div className="space-y-3">
              {categoryDistribution.map((slice) => (
                <div key={slice.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: slice.colorValue }} />
                    <span className="text-sm font-medium text-slate-700">{slice.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: slice.colorValue }}>{slice.percent}%</p>
                    <p className="text-xs text-slate-500">{slice.value} ideas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : <EmptyState icon={ClipboardCheck} title="No category data yet" description="Category breakdown will appear after your department receives submissions." />}
      </SectionCard>
    </div>
  )
}
