'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface ExpenseChartProps {
  data: Array<{ date: string; amount: number; previousAmount?: number }>;
  period?: 'week' | 'month' | 'year';
}

export function ExpenseChart({ data, period = 'month' }: ExpenseChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Gastos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'var(--muted-foreground)' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Gastos']}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="var(--primary)"
              fillOpacity={1}
              fill="url(#colorAmount)"
            />
            {data[0]?.previousAmount !== undefined && (
              <Line
                type="monotone"
                dataKey="previousAmount"
                stroke="var(--muted-foreground)"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

