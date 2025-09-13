import React, { useState, useEffect } from 'react';
import { Receipt, ReceiptListQuery } from '@origen/models';
import { formatCurrency } from '@origen/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Toggle } from './ui/toggle';
import { Upload, Plus, Search, Filter, Grid3X3, List, ArrowUpDown, MoreHorizontal, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { apiClient } from '@/lib/api';

interface ReceiptListProps {
  onAddManual: () => void;
  onUpload: () => void;
  onSelectReceipt: (receipt: Receipt) => void;
  onViewReceipt: (receipt: Receipt) => void;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({
  onAddManual,
  onUpload,
  onSelectReceipt,
  onViewReceipt,
}) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
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
          <div className="flex flex-col gap-4">
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
            
            {/* View Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">View:</span>
                <div className="flex items-center border rounded-md">
                  <Toggle
                    pressed={viewMode === 'grid'}
                    onPressedChange={() => setViewMode('grid')}
                    variant="outline"
                    size="sm"
                    className="border-0 rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Toggle>
                  <Toggle
                    pressed={viewMode === 'table'}
                    onPressedChange={() => setViewMode('table')}
                    variant="outline"
                    size="sm"
                    className="border-0 rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Toggle>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                  }))}
                >
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  {filters.sortOrder === 'asc' ? 'Oldest' : 'Newest'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Display */}
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
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receipts.map((receipt) => (
            <Card
              key={receipt.id}
              className="hover:shadow-md transition-shadow"
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
                  <div className="pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => onViewReceipt(receipt)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Receipt
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Number of Items</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow
                    key={receipt.id}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {receipt.merchant || 'Unknown Merchant'}
                    </TableCell>
                    <TableCell>
                      {receipt.items?.length || 0}
                    </TableCell>
                    <TableCell>
                      {receipt.purchaseDate
                        ? new Date(receipt.purchaseDate).toLocaleDateString()
                        : 'Not specified'}
                    </TableCell>
                    <TableCell>
                      {receipt.total && receipt.currency
                        ? formatCurrency(receipt.total, receipt.currency)
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSourceBadgeVariant(receipt.sourceType)}>
                        {receipt.sourceType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewReceipt(receipt)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
