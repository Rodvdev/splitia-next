'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomerLTV, useChurnAnalysis, useEngagementScores, useCustomerSegmentation } from '@/hooks/useCustomerAnalytics';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { ResponsiveTable } from '@/components/common/ResponsiveTable';

export default function AnalyticsCustomersPage() {
  const { ltv, loading: ltvLoading } = useCustomerLTV();
  const { churn, loading: churnLoading } = useChurnAnalysis();
  const { scores, loading: scoresLoading } = useEngagementScores();
  const { segments, loading: segmentsLoading } = useCustomerSegmentation();

  const avgLTV = ltv.length > 0 ? ltv.reduce((sum, c) => sum + c.ltv, 0) / ltv.length : 0;
  const avgChurnRate = churn.length > 0 ? churn.reduce((sum, c) => sum + c.churnRate, 0) / churn.length : 0;
  const avgEngagement = scores.length > 0 ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length : 0;

  if (ltvLoading || churnLoading || scoresLoading || segmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Análisis de Clientes</h1>
        <p className="text-muted-foreground">LTV, Churn, Engagement y más</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgLTV)}</div>
            <p className="text-xs text-muted-foreground">Lifetime Value promedio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Churn</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgChurnRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Último período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Score promedio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segmentos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segments.length}</div>
            <p className="text-xs text-muted-foreground">Segmentos activos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ltv">
        <TabsList>
          <TabsTrigger value="ltv">LTV</TabsTrigger>
          <TabsTrigger value="churn">Churn</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="segments">Segmentación</TabsTrigger>
        </TabsList>
        <TabsContent value="ltv" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Lifetime Value (LTV)</CardTitle>
            </CardHeader>
            <CardContent>
              {ltv.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay datos de LTV disponibles</p>
              ) : (
                <ResponsiveTable
                  headers={[
                    { label: 'Cliente' },
                    { label: 'LTV' },
                    { label: 'LTV Proyectado' },
                    { label: 'Ingresos Totales' },
                    { label: 'Frecuencia' },
                  ]}
                  rows={ltv.map((item) => [
                    item.customerName,
                    formatCurrency(item.ltv),
                    formatCurrency(item.projectedLtv),
                    formatCurrency(item.totalRevenue),
                    item.purchaseFrequency.toFixed(2),
                  ])}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="churn" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Churn</CardTitle>
            </CardHeader>
            <CardContent>
              {churn.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay datos de churn disponibles</p>
              ) : (
                <ResponsiveTable
                  headers={[
                    { label: 'Período' },
                    { label: 'Clientes Totales' },
                    { label: 'Churn' },
                    { label: 'Tasa de Churn' },
                    { label: 'Ingresos Perdidos' },
                  ]}
                  rows={churn.map((item) => [
                    item.period,
                    item.totalCustomers.toString(),
                    item.churnedCustomers.toString(),
                    `${item.churnRate.toFixed(2)}%`,
                    formatCurrency(item.revenueLost),
                  ])}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engagement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Scores</CardTitle>
            </CardHeader>
            <CardContent>
              {scores.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay datos de engagement disponibles</p>
              ) : (
                <ResponsiveTable
                  headers={[
                    { label: 'Cliente' },
                    { label: 'Score' },
                    { label: 'Tendencia' },
                    { label: 'Logins' },
                    { label: 'Acciones' },
                  ]}
                  rows={scores.map((item) => [
                    item.customerName,
                    item.score.toFixed(1),
                    item.trend,
                    item.metrics.logins.toString(),
                    item.metrics.actions.toString(),
                  ])}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="segments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Segmentación de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              {segments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay segmentos disponibles</p>
              ) : (
                <ResponsiveTable
                  headers={[
                    { label: 'Segmento' },
                    { label: 'Clientes' },
                    { label: 'LTV Promedio' },
                    { label: 'Engagement Promedio' },
                    { label: 'Características' },
                  ]}
                  rows={segments.map((item) => [
                    item.segment,
                    item.customerCount.toString(),
                    formatCurrency(item.averageLTV),
                    item.averageEngagement.toFixed(1),
                    item.characteristics.join(', '),
                  ])}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

