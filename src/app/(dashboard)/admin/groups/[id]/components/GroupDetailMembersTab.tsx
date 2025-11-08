'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GroupResponse } from '@/types';

export default function GroupDetailMembersTab({ group }: { group: GroupResponse }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Miembros ({group.members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {group.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold">
                    {member.user.name[0]}{member.user.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {member.user.name} {member.user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <Badge variant="outline">{member.role}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

