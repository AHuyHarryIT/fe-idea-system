import { Pagination } from "antd"
import type { PaginationProps } from "antd"

interface AppPaginationProps extends PaginationProps {
  containerClassName?: string
}

export function AppPagination({
  containerClassName = "",
  className = "",
  align = "end",
  showSizeChanger = true,
  style,
  current = 1,
  pageSize = 10,
  total = 0,
  showTotal,
  ...props
}: AppPaginationProps) {
  const safeCurrent = typeof current === "number" ? current : 1
  const safePageSize = typeof pageSize === "number" ? pageSize : 10
  const safeTotal = typeof total === "number" ? total : 0
  const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize))
  const rangeStart = safeTotal === 0 ? 0 : (safeCurrent - 1) * safePageSize + 1
  const rangeEnd =
    safeTotal === 0 ? 0 : Math.min(safeCurrent * safePageSize, safeTotal)
  const summary =
    typeof showTotal === "function"
      ? showTotal(safeTotal, [rangeStart, rangeEnd])
      : `${safeTotal} total items`
  const hasMultiplePages = totalPages > 1

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between ${containerClassName}`.trim()}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-700">{summary}</p>
        <p className="mt-1 text-xs text-slate-500">
          Page {safeCurrent} of {totalPages}
        </p>
      </div>

      {hasMultiplePages && (
        <div className="flex justify-end">
          <Pagination
            {...props}
            current={safeCurrent}
            total={safeTotal}
            pageSize={safePageSize}
            align={align}
            showSizeChanger={showSizeChanger}
            showTotal={undefined}
            className={className}
            style={{ rowGap: 12, ...style }}
            responsive
            showLessItems
          />
        </div>
      )}
    </div>
  )
}
