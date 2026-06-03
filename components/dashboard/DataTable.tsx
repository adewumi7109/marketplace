"use client";

import { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyTitle: string;
  emptyDescription: string;
  isLoading?: boolean;
};

export default function DataTable<T>({
  columns,
  data,
  emptyTitle,
  emptyDescription,
  isLoading,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
          <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={`px-4 py-3 ${column.className ?? ""}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-4">
                        <div className="h-4 w-full max-w-32 rounded bg-zinc-100" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="bg-white transition hover:bg-zinc-50">
                    {columns.map((column) => (
                      <td key={column.key} className={`px-4 py-4 align-middle ${column.className ?? ""}`}>
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {!isLoading && data.length === 0 && (
        <div className="px-4 py-10 text-center">
          <p className="text-sm font-semibold text-zinc-900">{emptyTitle}</p>
          <p className="mt-1 text-sm text-zinc-500">{emptyDescription}</p>
        </div>
      )}
    </div>
  );
}
