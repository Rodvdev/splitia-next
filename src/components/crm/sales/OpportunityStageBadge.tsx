import { OpportunityStage } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

const stageColors: Record<OpportunityStage, string> = {
  LEAD: 'bg-gray-500',
  QUALIFIED: 'bg-cyan-500',
  PROPOSAL: 'bg-orange-500',
  NEGOTIATION: 'bg-amber-500',
  CLOSED_WON: 'bg-green-500',
  CLOSED_LOST: 'bg-red-500',
};

const stageLabels: Record<OpportunityStage, string> = {
  LEAD: 'Lead',
  QUALIFIED: 'Calificado',
  PROPOSAL: 'Propuesta',
  NEGOTIATION: 'Negociación',
  CLOSED_WON: 'Cerrado ganado',
  CLOSED_LOST: 'Cerrado perdido',
};

interface OpportunityStageBadgeProps {
  stage: OpportunityStage;
  className?: string;
}

export function OpportunityStageBadge({ stage, className }: OpportunityStageBadgeProps) {
  return (
    <Badge className={cn(stageColors[stage], 'text-white', className)}>
      {stageLabels[stage]}
    </Badge>
  );
}
