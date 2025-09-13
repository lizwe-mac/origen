import React from 'react';
import { Receipt } from '@origen/models';
import { formatCurrency } from '@origen/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowLeft, Calendar, Store, Receipt as ReceiptIcon } from 'lucide-react';

interface ReceiptDetailProps {
  receipt: Receipt;
  onBack: () => void;
}

export const ReceiptDetail: React.FC<ReceiptDetailProps> = ({
  receipt,
  onBack,
}) => {
  const getSourceBadgeVariant = (sourceType: string) => {
    return sourceType === 'MANUAL' ? 'secondary' : 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Receipts
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Receipt Details</h1>
          <p className="text-muted-foreground">
            {receipt.merchant || 'Unknown Merchant'}
          </p>
        </div>
        <Badge variant={getSourceBadgeVariant(receipt.sourceType)}>
          {receipt.sourceType}
        </Badge>
      </div>

      {/* Receipt Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ReceiptIcon className="h-5 w-5" />
            Receipt Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Store className="h-4 w-4" />
                Merchant
              </div>
              <p className="font-medium">{receipt.merchant || 'Unknown Merchant'}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Date
              </div>
              <p className="font-medium">
                {receipt.purchaseDate
                  ? new Date(receipt.purchaseDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Not specified'}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <p className="text-2xl font-bold">
                {receipt.total && receipt.currency
                  ? formatCurrency(receipt.total, receipt.currency)
                  : 'N/A'}
              </p>
            </div>
          </div>
          
          {receipt.notes && (
            <div className="mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground mb-2">Notes</div>
              <p className="text-sm">{receipt.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items ({receipt.items?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!receipt.items || receipt.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No line items available for this receipt.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipt.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.name || `Item ${index + 1}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity || 1}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.unitPrice && receipt.currency
                        ? formatCurrency(item.unitPrice, receipt.currency)
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.totalPrice && receipt.currency
                        ? formatCurrency(item.totalPrice, receipt.currency)
                        : item.unitPrice && receipt.currency
                        ? formatCurrency((item.unitPrice * (item.quantity || 1)), receipt.currency)
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Total Row */}
                <TableRow className="border-t-2">
                  <TableCell colSpan={4} className="font-medium text-right">
                    Total:
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {receipt.total && receipt.currency
                      ? formatCurrency(receipt.total, receipt.currency)
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
