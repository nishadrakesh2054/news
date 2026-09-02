import {
  adminTable,
  adminTableCell,
  adminTableHead,
  adminTableHeadCell,
  adminTableRow,
} from "@/constants/admin-layout";

export type AdminTableColumn<T> = {
  key: string;
  label: string;
  headerClassName?: string;
  cellClassName?: string;
  align?: "left" | "right";
  render?: (row: T) => React.ReactNode;
};

type AdminDataTableProps<T> = {
  columns: AdminTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
};

export function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  loadingMessage = "Loading…",
  emptyMessage = "No records found.",
}: AdminDataTableProps<T>) {
  if (loading) {
    return <p className="px-3 py-6 text-xs text-muted-foreground">{loadingMessage}</p>;
  }

  if (rows.length === 0) {
    return <p className="px-3 py-6 text-xs text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className={adminTable}>
        <thead className={adminTableHead}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${adminTableHeadCell} ${col.headerClassName ?? ""} ${
                  col.align === "right" ? "text-right" : ""
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className={adminTableRow}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`${adminTableCell} ${col.cellClassName ?? ""} ${
                    col.align === "right" ? "text-right" : ""
                  }`}
                >
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
