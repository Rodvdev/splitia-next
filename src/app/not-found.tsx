import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-4xl">404</CardTitle>
          <CardDescription>Página no encontrada</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            La página que buscas no existe o ha sido movida.
          </p>
          <Link href="/dashboard">
            <Button>Volver al Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

