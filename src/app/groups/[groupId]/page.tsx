import NewExpenseModal from "../../../components/NewExpenseModal";
import { GroupMember } from "../../../lib/types";

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const members: GroupMember[] = [
    { id: "luis", name: "Luis Splitia" },
    { id: "israel", name: "Israel Splitia" },
    { id: "rodrigo", name: "Rodrigo Splitia" },
  ];
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Grupo {groupId}</h1>
      <p className="mt-2 text-sm opacity-80">Demo de creación de gasto</p>
      <NewExpenseModal groupId={groupId} members={members} />
    </main>
  );
}