import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewBudgetPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/budgets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Presupuesto</h1>
          <p className="text-muted-foreground">Crea un nuevo presupuesto mensual</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Presupuesto</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <Input id="amount" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Input id="currency" placeholder="USD" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Mes</Label>
                <Input id="month" type="number" min="1" max="12" placeholder="1-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Año</Label>
                <Input id="year" type="number" placeholder="2024" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Crear Presupuesto</Button>
              <Link href="/dashboard/budgets">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

