import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ErrorMessage({ message }: { message: string }) {
  return (
    <Card className="p-4 border-destructive">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <p className="text-sm">{message}</p>
      </div>
    </Card>
  );
}

