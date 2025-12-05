"use client";
import { useMemo, useState } from "react";
import { ShareInput, ShareType, ExpenseRequest, GroupMember } from "../lib/types";
import {
  to2,
  to3,
  hasPercent,
  hasEqual,
  percentSumIs100,
  calculatePercentageAmounts,
  calculateEqualAmounts,
  exceedsTotal,
  sumShares,
  remainder,
  hasDuplicates,
  uniqueByUserId,
} from "../lib/calc";
import axios from "axios";

interface Props {
  groupId: string;
  members: GroupMember[];
}

export default function NewExpenseModal({ groupId, members }: Props) {
  const [open, setOpen] = useState(true);
  const [amount, setAmount] = useState(20);
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [paidById, setPaidById] = useState("");
  const [shares, setShares] = useState<ShareInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const maxParticipants = members.length;

  const calculatedShares = useMemo(() => {
    let current = uniqueByUserId(shares);
    if (hasPercent(current)) current = calculatePercentageAmounts(amount, current);
    if (hasEqual(current)) current = calculateEqualAmounts(amount, current);
    return current.map(s => ({ ...s, amount: s.type === "EQUAL" ? to3(s.amount) : to2(s.amount) }));
  }, [shares, amount]);

  const canAddMore = uniqueByUserId(shares).length < maxParticipants;

  const percentRuleOk = !hasPercent(shares) || percentSumIs100(shares);
  const equalAllowed = !hasPercent(shares);
  const fixedOk = !exceedsTotal(amount, shares);
  const totalsClose = to2(sumShares(calculatedShares)) <= to2(amount);
  const submitEnabled = percentRuleOk && equalAllowed && fixedOk && !hasDuplicates(shares) && totalsClose && paidById;

  function addShare(userId: string, type: ShareType) {
    if (!canAddMore) return;
    if (shares.find(s => s.userId === userId)) return;
    if (type === "EQUAL" && !equalAllowed) return;
    const initial = type === "FIXED" ? 0 : type === "PERCENTAGE" ? 0 : 0;
    setShares(prev => [...prev, { userId, amount: initial, type }]);
  }

  function removeShare(userId: string) {
    setShares(prev => prev.filter(s => s.userId !== userId));
  }

  function divideEqually(includePayer: boolean) {
    if (!equalAllowed) return;
    const ids = includePayer ? members.map(m => m.id) : members.filter(m => m.id !== paidById).map(m => m.id);
    const picks = Array.from(new Set(ids)).slice(0, maxParticipants);
    const next: ShareInput[] = picks.map(id => ({ userId: id, amount: 0, type: "EQUAL" }));
    setShares(next);
  }

  async function submit() {
    setError(null);
    if (!submitEnabled) return;
    const body: ExpenseRequest = {
      amount: to2(amount),
      groupId,
      paidById,
      shares: calculatedShares,
      description,
      currency,
      notes,
      date,
      location,
    };
    try {
      const res = await axios.post("http://localhost:8080/api/expenses", body);
      if (res.status >= 200 && res.status < 300) setOpen(false);
    } catch (e: unknown) {
      const message = (e && typeof e === 'object' && 'response' in e)
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : (e && typeof e === 'object' && 'message' in e)
          ? (e as { message?: string }).message
          : undefined;
      setError(message || "Error desconocido");
    }
  }

  return open ? (
    <div className="fixed inset-0 grid place-items-center bg-black/10 p-4">
      <div className="w-[680px] max-h-[85vh] overflow-auto rounded-md bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Crear Nuevo Gasto</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span>Monto *</span>
            <input className="border rounded px-2 py-1" type="number" step="0.01" value={amount} onChange={e => setAmount(to2(Number(e.target.value)))} />
          </label>
          <label className="grid gap-1">
            <span>Fecha *</span>
            <input className="border rounded px-2 py-1" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>
          <label className="col-span-2 grid gap-1">
            <span>Descripción *</span>
            <input className="border rounded px-2 py-1" value={description} onChange={e => setDescription(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span>Moneda</span>
            <input className="border rounded px-2 py-1" value={currency} onChange={e => setCurrency(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span>Ubicación</span>
            <input className="border rounded px-2 py-1" value={location} onChange={e => setLocation(e.target.value)} />
          </label>
          <label className="col-span-2 grid gap-1">
            <span>Notas</span>
            <input className="border rounded px-2 py-1" value={notes} onChange={e => setNotes(e.target.value)} />
          </label>
          <label className="col-span-2 grid gap-1">
            <span>Pagado por *</span>
            <select className="border rounded px-2 py-1" value={paidById} onChange={e => setPaidById(e.target.value)}>
              <option value="">Seleccionar</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Participaciones *</span>
            <div className="flex gap-2">
              <button className="rounded border px-2 py-1" onClick={() => divideEqually(true)} disabled={!equalAllowed}>Dividir Igualmente</button>
              <div className="flex gap-1">
                <select className="border rounded px-2 py-1" id="add-user">
                  {members.filter(m => !shares.find(s => s.userId === m.id)).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <select className="border rounded px-2 py-1" id="add-type">
                  <option value="FIXED">Fijo</option>
                  <option value="PERCENTAGE">Porcentaje</option>
                  <option value="EQUAL">Igual</option>
                </select>
                <button className="rounded bg-black text-white px-2 py-1" onClick={() => {
                  const userId = (document.getElementById("add-user") as HTMLSelectElement).value;
                  const type = (document.getElementById("add-type") as HTMLSelectElement).value as ShareType;
                  addShare(userId, type);
                }} disabled={!canAddMore}>Agregar</button>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            {calculatedShares.map(s => (
              <div key={s.userId} className="grid grid-cols-[1fr_120px_160px_32px] items-center gap-2">
                <select className="border rounded px-2 py-1" value={s.userId} disabled>
                  <option>{members.find(m => m.id === s.userId)?.name || s.userId}</option>
                </select>
                <input className="border rounded px-2 py-1" type="number" step={s.type === "PERCENTAGE" ? 1 : 0.001} value={s.type === "PERCENTAGE" ? shares.find(x => x.userId === s.userId)?.amount || 0 : s.amount} onChange={e => {
                  const v = Number(e.target.value);
                  setShares(prev => prev.map(x => x.userId === s.userId ? { ...x, amount: s.type === "PERCENTAGE" ? v : to3(v) } : x));
                }} disabled={s.type === "EQUAL"} />
                <select className="border rounded px-2 py-1" value={s.type} onChange={e => {
                  const next = e.target.value as ShareType;
                  setShares(prev => prev.map(x => x.userId === s.userId ? { ...x, type: next, amount: 0 } : x));
                }} disabled={true}>
                  <option value="FIXED">Fijo</option>
                  <option value="PERCENTAGE">Porcentaje</option>
                  <option value="EQUAL">Igual</option>
                </select>
                <button className="rounded border px-2 py-1" onClick={() => removeShare(s.userId)}>×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-1 text-sm">
          <div>Total: {to2(amount)} | Fijos: {to2(remainder(amount, shares) !== to2(amount) ? to2(amount - remainder(amount, shares)) : 0)} | Remanente: {remainder(amount, shares)}</div>
          {hasPercent(shares) && <div>Porcentajes: {sumShares(shares.filter(s => s.type === "PERCENTAGE"))}%</div>}
          <div>Sumatoria de participaciones calculadas: {sumShares(calculatedShares)}</div>
        </div>

        <div className="mt-3 text-sm">
          {!percentRuleOk && <div className="text-red-600">Los porcentajes deben sumar 100% del remanente</div>}
          {!equalAllowed && <div className="text-red-600">No se permiten partes iguales si hay porcentajes</div>}
          {!fixedOk && <div className="text-red-600">El total de montos fijos excede el monto del gasto</div>}
          {hasDuplicates(shares) && <div className="text-red-600">No se permiten usuarios duplicados</div>}
          {error && <div className="text-red-600">{error}</div>}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded border px-3 py-2" onClick={() => setOpen(false)}>Cancelar</button>
          <button className="rounded bg-black px-3 py-2 text-white" onClick={submit} disabled={!submitEnabled}>Crear Gasto</button>
        </div>
      </div>
    </div>
  ) : null;
}