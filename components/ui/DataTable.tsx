import type { ReactNode } from 'react'
import ui from '@/styles/ui.module.css'

export type Column<T> = {
  key: string
  header: string
  render?: (row: T) => ReactNode
  align?: 'left' | 'right'
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  loading?: boolean
  emptyIcon?: string
  emptyTitle?: string
  emptyDescription?: string
  skeletonRows?: number
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyIcon = '📭',
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Data akan muncul di sini setelah ditambahkan.',
  skeletonRows = 5,
}: DataTableProps<T>) {
  return (
    <div className={ui.tableWrap}>
      <table className={ui.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  width: col.width,
                  textAlign: col.align === 'right' ? 'right' : 'left',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading &&
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`}>
                {columns.map((col) => (
                  <td key={col.key}>
                    <span className={ui.skeleton} />
                  </td>
                ))}
              </tr>
            ))}

          {!loading &&
            rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      textAlign: col.align === 'right' ? 'right' : 'left',
                    }}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {!loading && rows.length === 0 && (
        <div className={ui.empty}>
          <div className={ui.emptyIcon}>{emptyIcon}</div>
          <div className={ui.emptyTitle}>{emptyTitle}</div>
          <div className={ui.emptyDesc}>{emptyDescription}</div>
        </div>
      )}
    </div>
  )
}
