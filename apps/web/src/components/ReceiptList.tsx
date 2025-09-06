import React, { useState, useEffect } from 'react';
import { Receipt, ReceiptListQuery } from '@origen/models';
import { formatCurrency } from '@origen/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Upload, Plus, Search, Filter } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface ReceiptListProps {
  onAddManual: () => void;
  onUpload: () => void;
  onSelectReceipt: (receipt: Receipt) => void;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({
  onAddManual,
  onUpload,
  onSelectReceipt,
}) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ReceiptListQuery>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const query: ReceiptListQuery = {
        ...filters,
        ...(searchTerm && { merchant: searchTerm }),
      };
      const response = await apiClient.listReceipts(query);
      setReceipts(response.data);
    } catch (error) {
      console.error('Failed to load receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, [filters, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadReceipts();
  };

  const getSourceBadgeVariant = (sourceType: string) => {
    return sourceType === 'MANUAL' ? 'secondary' : 'default';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Loading receipts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Receipts</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Receipt
          </Button>
          <Button onClick={onAddManual}>
            <Plus className="mr-2 h-4 w-4" />
            Add Manual Receipt
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by merchant name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Receipts Grid */}
      {receipts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              No receipts found. Start by adding your first receipt!
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={onUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Receipt
              </Button>
              <Button onClick={onAddManual}>
                <Plus className="mr-2 h-4 w-4" />
                Add Manual Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receipts.map((receipt) => (
            <Card
              key={receipt.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectReceipt(receipt)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{receipt.merchant || 'Unknown Merchant'}</CardTitle>
                  <Badge variant={getSourceBadgeVariant(receipt.sourceType)}>
                    {receipt.sourceType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span>
                      {receipt.purchaseDate
                        ? new Date(receipt.purchaseDate).toLocaleDateString()
                        : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">
                      {receipt.total && receipt.currency
                        ? formatCurrency(receipt.total, receipt.currency)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items:</span>
                    <span>{receipt.items?.length || 0}</span>
                  </div>
                  {receipt.notes && (
                    <div className="text-xs text-muted-foreground mt-2 truncate">
                      {receipt.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
