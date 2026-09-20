import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { T } from "@/components/i18n";
import type { TranslationKey } from "@/shared/translations";
import { cn } from "cn";

export interface Column<T> {
  key: string;
  headerKey: TranslationKey;
  render?: (row: T) => React.ReactNode;
  width?: string;
  /** Reserved for the later sorting slice; no behavior in this slice. */
  sortable?: boolean;
}

/**
 * Starter table. Typed columns plus rows plus a row key. Loading renders
 * skeleton rows apart from the empty state, so the two never mix.
 */
export function AppTable<T extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  isLoading,
  emptyKey,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: keyof T & string;
  isLoading?: boolean;
  emptyKey: TranslationKey;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key} style={column.width ? { width: column.width } : undefined}>
              <T k={column.headerKey} />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? [0, 1, 2].map((index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell colSpan={columns.length}>
                  <span className={cn("block h-4 animate-pulse rounded bg-muted")} aria-label="loading" />
                </TableCell>
              </TableRow>
            ))
          : rows.length === 0
            ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  <T k={emptyKey} />
                </TableCell>
              </TableRow>
            )
            : (
              rows.map((row) => (
                <TableRow key={String(row[rowKey])}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(row) : String(row[column.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
      </TableBody>
    </Table>
  );
}
