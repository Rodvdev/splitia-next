'use client';

import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

interface ResponsiveTableProps {
  headers: Array<{ label: string; className?: string }>;
  rows: Array<Array<ReactNode>>;
  className?: string;
  emptyMessage?: string;
}

export function ResponsiveTable({ headers, rows, className, emptyMessage = 'No hay datos disponibles' }: ResponsiveTableProps) {
  const isMobile = useIsMobile();

  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        {rows.map((row, rowIndex) => (
          <Card key={rowIndex} className="overflow-hidden">
            <CardContent className="p-4 space-y-2">
              {headers.map((header, colIndex) => (
                <div key={colIndex} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-xs font-semibold text-muted-foreground sm:w-1/3">
                    {header.label}:
                  </span>
                  <span className="text-sm sm:w-2/3 break-words">
                    {row[colIndex]}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <table className={cn('w-full', className)}>
        <thead>
          <tr className="border-b bg-muted/50">
            {headers.map((header, index) => (
              <th
                key={index}
                className={cn('px-4 py-3 text-left text-sm font-semibold', header.className)}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b hover:bg-muted/50 transition-colors">
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="px-4 py-3 text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

