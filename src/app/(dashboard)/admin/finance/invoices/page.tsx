'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { financeApi } from '@/lib/api/finance';
import { InvoiceResponse, InvoiceStatus } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ResponsiveTable } from '@/components/common/ResponsiveTable';
import { Search, Plus, MoreVertical, Eye, Edit, Trash2, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useWebSocket, WS_CHANNELS } from '@/lib/websocket/WebSocketProvider';

export default function AdminInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { subscribe, connected } = useWebSocket();

  useEffect(() => {
    loadInvoices();
  }, []);

  // Suscripción a actualizaciones en tiempo real
  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe(WS_CHANNELS.FINANCE_INVOICES, (message) => {
      const { type, action, entityId, data } = message;
      
      if (type === 'INVOICE_CREATED' || type === 'INVOICE_UPDATED' || action === 'CREATED' || action === 'UPDATED') {
        const invoice = data.invoice || data as InvoiceResponse;
        setInvoices((prev) => {
          const existingIndex = prev.findIndex((i) => i.id === invoice.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = invoice;
            return updated;
          } else {
            return [invoice, ...prev];
          }
        });
        
        if (type === 'INVOICE_CREATED' || action === 'CREATED') {
          toast.success(`Nueva factura: ${invoice.invoiceNumber}`);
        } else if (invoice.status === 'PAID') {
          toast.success(`Factura ${invoice.invoiceNumber} marcada como pagada`);
        }
      } else if (type === 'INVOICE_DELETED' || action === 'DELETED') {
        const id = entityId || data.id;
        setInvoices((prev) => prev.filter((i) => i.id !== id));
        toast.info('Factura eliminada');
      } else if (type === 'INVOICE_PAID' || type === 'INVOICE_STATUS_CHANGED' || action === 'STATUS_CHANGED') {
        const id = entityId || data.id;
        const status = data.status || data.newStatus;
        setInvoices((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status } : i))
        );
      }
    });

    return unsubscribe;
  }, [subscribe, connected]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await financeApi.getAllInvoices({
        page: 0,
        size: 50,
        status: statusFilter !== 'ALL' ? (statusFilter as InvoiceStatus) : undefined,
      });
      apiLogger.general({
        endpoint: 'getAllInvoices',
        success: response.success,
        params: { page: 0, size: 50, status: statusFilter },
        data: response.data,
        error: response.success ? null : response,
      });
      const pageData = extractDataFromResponse(response);
      setInvoices(pageData.content || []);
    } catch (error) {
      apiLogger.general({
        endpoint: 'getAllInvoices',
        success: false,
        params: { page: 0, size: 50 },
        error: error,
      });
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadInvoices();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta factura?')) return;

    try {
      const response = await financeApi.deleteInvoice(id);
      apiLogger.general({
        endpoint: 'deleteInvoice',
        success: response.success,
        params: { id },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Factura eliminada exitosamente');
        loadInvoices();
      }
    } catch (error) {
      apiLogger.general({
        endpoint: 'deleteInvoice',
        success: false,
        params: { id },
        error: error,
      });
      toast.error('Error al eliminar la factura');
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      // TODO: Implementar endpoint de descarga de PDF cuando esté disponible en el backend
      toast.info('Descarga de PDF próximamente');
    } catch (error) {
      toast.error('Error al descargar el PDF');
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const statusColors: Record<InvoiceStatus, string> = {
    DRAFT: 'bg-gray-500',
    SENT: 'bg-blue-500',
    PAID: 'bg-green-500',
    OVERDUE: 'bg-red-500',
    VOID: 'bg-gray-400',
  };

  const statusLabels: Record<InvoiceStatus, string> = {
    DRAFT: 'Borrador',
    SENT: 'Enviada',
    PAID: 'Pagada',
    OVERDUE: 'Vencida',
    VOID: 'Anulada',
  };

  const tableHeaders = [
    { label: 'Número' },
    { label: 'Contacto' },
    { label: 'Empresa' },
    { label: 'Fecha Emisión' },
    { label: 'Fecha Vencimiento' },
    { label: 'Total' },
    { label: 'Pagado' },
    { label: 'Estado' },
    { label: 'Acciones' },
  ];

  const tableRows = filteredInvoices.map((invoice) => [
    <Link
      key={invoice.id}
      href={`/admin/finance/invoices/${invoice.id}`}
      className="font-medium text-primary hover:underline"
    >
      {invoice.invoiceNumber}
    </Link>,
    <span key={`${invoice.id}-contact`}>{invoice.contactName || '-'}</span>,
    <span key={`${invoice.id}-company`}>{invoice.companyName || '-'}</span>,
    <span key={`${invoice.id}-issue`}>{formatDate(invoice.issueDate, 'dd/MM/yyyy')}</span>,
    <span key={`${invoice.id}-due`}>{formatDate(invoice.dueDate, 'dd/MM/yyyy')}</span>,
    <span key={`${invoice.id}-total`} className="font-medium">
      {formatCurrency(invoice.total, invoice.currency)}
    </span>,
    <span key={`${invoice.id}-paid`} className="font-medium">
      {formatCurrency(invoice.paidAmount, invoice.currency)}
    </span>,
    <Badge
      key={`${invoice.id}-status`}
      className={statusColors[invoice.status] + ' text-white'}
    >
      {statusLabels[invoice.status]}
    </Badge>,
    <DropdownMenu key={`${invoice.id}-actions`}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/finance/invoices/${invoice.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            Ver
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownloadPDF(invoice.id)}>
          <Download className="h-4 w-4 mr-2" />
          Descargar PDF
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/finance/invoices/${invoice.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(invoice.id)} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facturas</h1>
          <p className="text-muted-foreground">Gestiona facturas emitidas y recibidas</p>
        </div>
        <Link href="/admin/finance/invoices/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Factura
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Facturas</CardTitle>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, contacto, empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="ALL">Todos los estados</option>
              <option value="DRAFT">Borrador</option>
              <option value="SENT">Enviada</option>
              <option value="PAID">Pagada</option>
              <option value="OVERDUE">Vencida</option>
              <option value="VOID">Anulada</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <EmptyState
              title="No hay facturas"
              description={
                searchTerm || statusFilter !== 'ALL'
                  ? 'No se encontraron facturas con esos filtros'
                  : 'No hay facturas registradas'
              }
            />
          ) : (
            <ResponsiveTable headers={tableHeaders} rows={tableRows} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

