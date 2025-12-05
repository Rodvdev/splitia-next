## Alcance
- Adaptar el formulario de “Crear Nuevo Gasto” en `src/app/(dashboard)/dashboard/groups/[id]/page.tsx` para cumplir reglas de FIXED, PERCENTAGE y EQUAL.
- Mantener contrato de API: POST `http://localhost:8080/api/expenses` vía `expensesApi.create` (`src/lib/api/expenses.ts:22-25`).
- No crear nuevas páginas; usar las existentes (login ya está: `src/app/(auth)/login/page.tsx`).

## Ubicaciones clave
- Formulario y modal de gasto: `src/app/(dashboard)/dashboard/groups/[id]/page.tsx` (crear/editar)
  - Igualar: función `calculateEqualShares` (`page.tsx:311-322`).
  - Render de participaciones: `page.tsx:1088-1153`.
- Tipos de gasto/participación: `src/types/api/expense.ts` (`ExpenseShareRequest`, `CreateExpenseRequest`).
- Cliente API y base URL: `src/lib/api/client.ts:5` y `src/lib/api/expenses.ts`.

## Cambios de UI y reglas
- FIXED
  - Redondear a 2 decimales al ingresar y antes de enviar.
  - Resta del `amount` (total) para calcular `remanente`.
- PERCENTAGE
  - Input de porcentaje en rango [0, 100] para cada participación.
  - Calcular y mostrar en tiempo real el monto monetario por porcentaje sobre el `remanente` (solo lectura).
  - Validar que la suma de porcentajes sea exactamente 100; si no, deshabilitar “Crear Gasto” y mostrar: “Los porcentajes deben sumar 100% del remanente”.
  - Si existe al menos un `PERCENTAGE` en la lista, deshabilitar `EQUAL` y el botón “Dividir Igualmente”.
- EQUAL
  - Solo permitido cuando NO hay `PERCENTAGE` presente.
  - Dividir el `remanente` tras FIXED en partes iguales, redondeando a 2 decimales y ajustando el último para cerrar el total.
  - “Dividir Igualmente” generará entradas para todos los miembros del grupo (incluido `paidBy`) por defecto.
- Límites y duplicados
  - No permitir más participaciones que miembros del grupo.
  - Evitar duplicados por `userId`. Si el usuario ya existe, bloquear cambio de `type` y no permitir agregarlo de nuevo.
  - Validar que todos los usuarios seleccionados pertenecen al grupo (opciones ya provienen de `groupMembers`).
- UX y validaciones adicionales
  - Deshabilitar “Crear Gasto” si: porcentajes ≠ 100, FIXED excede total, suma de shares monetarias excede total, o hay duplicados.
  - Al cambiar `type` o `amount`, recalcular vista previa y cerrar visualmente el total.
  - Mostrar mensajes del backend en errores (e.g., “Sum of fixed shares exceeds the expense amount”, “Sum of percentage shares must equal 100% of the remainder”, “Equal shares are not allowed when percentage shares are present”, “Sum of shares exceeds the expense amount”, “Multiple share entries for the same user with different types”).

## Implementación técnica
- Agregar utilidades de cálculo (si no existen, usar/ajustar `src/lib/calc.ts`):
  - `sumFixed(shares)`, `remainder(total, shares)`, `percentSumIs100(shares)`, `calculatePercentageAmounts(total, shares)`, `calculateEqualAmounts(total, shares)` con redondeo a 2 decimales y ajuste del último.
  - `hasPercent(shares)`, `hasDuplicates(shares)`, `sumShares(shares)`.
- Integrar utilidades en `page.tsx`:
  - Computar `remanente` y vista previa de montos por tipo.
  - Reemplazar `calculateEqualShares` para usar `remanente` y ajuste del último a 2 decimales.
  - Bloquear/ocultar acciones según reglas (disabled de botones Agregar/Dividir, readOnly de monto cuando `type=PERCENTAGE`).
  - Añadir validaciones que deshabiliten el submit y muestren mensajes.
- Envío al backend:
  - Mantener el contrato actual: para `PERCENTAGE` enviar `amount` como porcentaje; para `FIXED`/`EQUAL` como monto monetario.

## Pruebas manuales
- Fijo + Porcentaje: `amount=20`, Luis FIXED=10, Israel PERCENTAGE=60, Rodrigo PERCENTAGE=40 → Vista previa: 10, 6, 4; botón habilitado.
- Igual entre 3: `amount=20`, tres EQUAL → 6.67, 6.67, 6.66 ajustado; botón habilitado.
- Rechazos:
  - Porcentajes 55 y 65 (120) → deshabilitar y mensaje.
  - Porcentajes 70 y 20 (90) → deshabilitar y mensaje.
  - FIXED que excede `amount` → deshabilitar y mensaje.

## Verificación y arranque
- Ejecutar `npm run dev` y validar:
  - Login: `http://localhost:3000/(auth)/login` o `/login` (ya existe: `src/app/(auth)/login/page.tsx`).
  - Grupos: `http://localhost:3000/dashboard/groups/{id}`; abrir modal “Nuevo Gasto” y verificar reglas.
  - Endpoint consume `http://localhost:8080/api/expenses` (backend ya en marcha).

## Entregables
- UI de participaciones alineada con reglas backend.
- Vista previa de montos y validaciones en tiempo real.
- Botón de creación deshabilitado según reglas.
- Mensajes de error del backend visibles.

¿Confirmas que proceda con estos cambios y levante el servidor para que revises?