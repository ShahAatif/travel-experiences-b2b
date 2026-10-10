'use client';

import AgencyLayout from '@/app/agency/layout';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/loading';
import { cn } from '@/lib/utils';
import { Calendar, DollarSign, Download, Eye } from 'lucide-react';

export default function AgencyInvoicesPage() {
  const { data: invoices, isLoading } = useQuery<any[], Error>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await fetch('/api/invoices', { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return res.json();
    },
  });

  const statusStyles: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SENT: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
  };

  if (isLoading) {
    return (
      <AgencyLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </AgencyLayout>
    );
  }

  return (
    <AgencyLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and download your invoices
          </p>
        </div>

        {invoices && invoices.length > 0 ? (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {invoice.invoiceNumber}
                      </span>
                      <Badge className={statusStyles[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${invoice.total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Booking: {invoice.booking?.bookingNumber}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <DollarSign className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No invoices yet
            </h3>
            <p className="text-gray-500 mb-4">
              Invoices will be generated when bookings are paid
            </p>
          </Card>
        )}
      </div>
    </AgencyLayout>
  );
}