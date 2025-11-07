import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewGroupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crear Grupo</h1>
        <p className="text-muted-foreground">Crea un nuevo grupo para compartir gastos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Grupo</Label>
              <Input id="name" placeholder="Ej: Viaje a París" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" placeholder="Descripción opcional" />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Crear Grupo</Button>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

