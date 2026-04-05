import { Bar, Line } from '@ant-design/charts'
import { BarChart3, Users } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import {
  QA_MANAGER_DEPARTMENT_SERIES,
  QA_MANAGER_TREND_SERIES,
  type DepartmentSummary,
} from '@/features/dashboard/qa-manager/helpers/qa-manager-dashboard'

interface QAManagerChartsSectionProps {
  error?: Error | null
  ideasCount: number
  trendChartData: Array<{ month: string; series: string; value: number }>
  departmentChartData: Array<{ department: string; series: string; value: number }>
  departmentSummaries: DepartmentSummary[]
  departmentMax: number
}

export function QAManagerChartsSection({
  error,
  ideasCount,
  trendChartData,
  departmentChartData,
  departmentSummaries,
  departmentMax,
}: QAManagerChartsSectionProps) {
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <SectionCard
        title="University-wide trends"
        description="Recent movement across ideas, comments, and contributors."
      >
        {error ? (
          <EmptyState icon={BarChart3} title="Trend data unavailable" description={error.message} />
        ) : ideasCount > 0 ? (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
            <Line
              data={trendChartData}
              xField="month"
              yField="value"
              seriesField="series"
              height={288}
              colorField="series"
              scale={{
                color: {
                  domain: QA_MANAGER_TREND_SERIES.map((series) => series.key),
                  range: QA_MANAGER_TREND_SERIES.map((series) => series.color),
                },
              }}
              smooth
              style={{ lineWidth: 3 }}
              point={{
                size: 4,
                shape: 'circle',
                style: { fill: '#ffffff', lineWidth: 2 },
              }}
              legend={false}
              tooltip={{ title: 'month' }}
              axis={{
                x: { title: false, line: true, tick: false },
                y: { title: false, grid: true },
              }}
            />

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
              {QA_MANAGER_TREND_SERIES.map((series) => (
                <span key={series.key} className="inline-flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: series.color }}
                  />
                  {series.key}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="No trend data yet"
            description="Trend lines will appear after the idea feed has more activity."
          />
        )}
      </SectionCard>

      <SectionCard
        title="Department comparison"
        description="Compare idea volume and comment activity between departments."
      >
        {error ? (
          <EmptyState
            icon={Users}
            title="Department data unavailable"
            description={error.message}
          />
        ) : departmentSummaries.length > 0 ? (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
            <Bar
              data={departmentChartData}
              xField="department"
              yField="value"
              seriesField="series"
              colorField="series"
              height={320}
              group
              scale={{
                color: {
                  domain: QA_MANAGER_DEPARTMENT_SERIES.map((series) => series.key),
                  range: QA_MANAGER_DEPARTMENT_SERIES.map((series) => series.color),
                },
                y: { domainMax: departmentMax },
              }}
              legend={false}
              tooltip={{ title: 'department' }}
              axis={{
                x: { title: false },
                y: { title: false, grid: true },
              }}
              label={{
                text: 'value',
                position: 'inside',
                style: {
                  fill: '#ffffff',
                  fontSize: 12,
                  fontWeight: 600,
                  stroke: 'rgba(15, 23, 42, 0.15)',
                  lineWidth: 2,
                },
              }}
            />

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
              {QA_MANAGER_DEPARTMENT_SERIES.map((series) => (
                <span key={series.key} className="inline-flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: series.color }}
                  />
                  {series.key}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No department data yet"
            description="Department comparisons will appear after idea activity is recorded."
          />
        )}
      </SectionCard>
    </div>
  )
}
