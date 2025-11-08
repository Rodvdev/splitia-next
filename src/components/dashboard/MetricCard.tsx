'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  onClick,
}: MetricCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-success/20 bg-success/5',
    warning: 'border-warning/20 bg-warning/5',
    danger: 'border-destructive/20 bg-destructive/5',
  };

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md cursor-pointer',
        variantStyles[variant],
        onClick && 'hover:scale-[1.02]'
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            'p-1.5 sm:p-2 rounded-lg flex-shrink-0',
            variant === 'success' && 'bg-success/10',
            variant === 'warning' && 'bg-warning/10',
            variant === 'danger' && 'bg-destructive/10',
            variant === 'default' && 'bg-primary/10'
          )}>
            <Icon className={cn(
              'h-3 w-3 sm:h-4 sm:w-4',
              variant === 'success' && 'text-success',
              variant === 'warning' && 'text-warning',
              variant === 'danger' && 'text-destructive',
              variant === 'default' && 'text-primary'
            )} />
          </div>
          <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-bold break-words">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 text-success flex-shrink-0" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive flex-shrink-0" />
              )}
              <span className={cn(
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                {Math.abs(trend.value)}% {trend.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

