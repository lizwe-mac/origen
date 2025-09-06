import React from 'react';
import { useMachine } from '@xstate/react';
import { receiptEntryMachine, getReceiptDataFromContext } from '@origen/state';
import { formatCurrency, calculateTotal } from '@origen/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface ManualReceiptFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ManualReceiptForm: React.FC<ManualReceiptFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [state, send] = useMachine(receiptEntryMachine);
  const { context } = state;

  const handleSubmit = async () => {
    try {
      const receiptData = getReceiptDataFromContext(context);
      await apiClient.createManualReceipt(receiptData);
      send({ type: 'SUBMIT_SUCCESS' });
      onSuccess();
    } catch (error) {
      console.error('Failed to create receipt:', error);
      send({ type: 'SUBMIT_ERROR' });
    }
  };

  const addItem = () => {
    send({
      type: 'ADD_ITEM',
      item: {
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const item = { [field]: value };
    
    // Auto-calculate total when quantity or unitPrice changes
    if (field === 'quantity' || field === 'unitPrice') {
      const currentItem = context.items[index];
      const quantity = field === 'quantity' ? value : currentItem.quantity;
      const unitPrice = field === 'unitPrice' ? value : currentItem.unitPrice;
      // Convert unitPrice to number for calculation
      const unitPriceNum = typeof unitPrice === 'string' ? parseFloat(unitPrice) || 0 : unitPrice;
      item.total = calculateTotal(quantity, unitPriceNum);
    }

    send({
      type: 'UPDATE_ITEM',
      index,
      item,
    });
  };

  const removeItem = (index: number) => {
    send({ type: 'REMOVE_ITEM', index });
  };

  const renderDetailsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Receipt Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="merchant">Merchant Name *</Label>
          <Input
            id="merchant"
            value={context.merchant}
            onChange={(e) => send({ type: 'UPDATE_MERCHANT', merchant: e.target.value })}
            placeholder="Enter merchant name"
          />
        </div>

        <div>
          <Label htmlFor="purchaseDate">Purchase Date *</Label>
          <Input
            id="purchaseDate"
            type="datetime-local"
            value={context.purchaseDate}
            onChange={(e) => send({ type: 'UPDATE_PURCHASE_DATE', purchaseDate: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            value={context.currency}
            onChange={(e) => send({ type: 'UPDATE_CURRENCY', currency: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="ZAR">ZAR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div>
          <Label htmlFor="tax">Tax (optional)</Label>
          <Input
            id="tax"
            type="number"
            step="0.01"
            value={context.tax || ''}
            onChange={(e) => send({ type: 'UPDATE_TAX', tax: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <textarea
            id="notes"
            value={context.notes}
            onChange={(e) => send({ type: 'UPDATE_NOTES', notes: e.target.value })}
            placeholder="Additional notes..."
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={() => send({ type: 'NEXT_STEP' })}
            disabled={!context.merchant.trim() || !context.purchaseDate}
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderItemsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Line Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {context.items.map((item, index) => (
          <div key={index} className="grid grid-cols-5 gap-2 items-end">
            <div>
              <Label>Description</Label>
              <Input
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                placeholder="Item description"
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input
                type="text"
                placeholder="20.99"
                value={item.unitPrice}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  // Allow the user to type decimals by storing the raw string value
                  // Only parse to number when we need to calculate
                  updateItem(index, 'unitPrice', inputValue);
                }}
              />
            </div>
            <div>
              <Label>Total</Label>
              <Input
                type="number"
                step="0.01"
                value={item.total}
                onChange={(e) => updateItem(index, 'total', parseFloat(e.target.value) || 0)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => removeItem(index)}
              disabled={context.items.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button variant="outline" onClick={addItem} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => send({ type: 'PREVIOUS_STEP' })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={() => send({ type: 'NEXT_STEP' })}
            disabled={context.items.length === 0 || context.items.some(item => 
              !item.description.trim() || item.quantity <= 0 || (parseFloat(item.unitPrice) || 0) <= 0
            )}
          >
            Review <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderReviewStep = () => {
    const total = context.items.reduce((sum, item) => sum + item.total, 0);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Receipt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Merchant</Label>
              <p className="text-sm font-medium">{context.merchant}</p>
            </div>
            <div>
              <Label>Date</Label>
              <p className="text-sm font-medium">
                {new Date(context.purchaseDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label>Currency</Label>
              <p className="text-sm font-medium">{context.currency}</p>
            </div>
            {context.tax && (
              <div>
                <Label>Tax</Label>
                <p className="text-sm font-medium">{formatCurrency(context.tax, context.currency)}</p>
              </div>
            )}
          </div>

          {context.notes && (
            <div>
              <Label>Notes</Label>
              <p className="text-sm">{context.notes}</p>
            </div>
          )}

          <div>
            <Label>Items</Label>
            <div className="space-y-2">
              {context.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.description} (x{item.quantity})</span>
                  <span>{formatCurrency(item.total, context.currency)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-2">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(total, context.currency)}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => send({ type: 'PREVIOUS_STEP' })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={context.isSubmitting}
            >
              {context.isSubmitting ? 'Saving...' : 'Save Receipt'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (state.matches('done')) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <h3 className="text-lg font-medium text-green-600 mb-2">Receipt Saved!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your manual receipt has been successfully created.
          </p>
          <Button onClick={() => send({ type: 'RESET' })}>
            Create Another Receipt
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state.matches('error')) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Failed to save receipt. Please try again.
          </p>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => send({ type: 'RESET' })}>
              Start Over
            </Button>
            <Button onClick={() => send({ type: 'PREVIOUS_STEP' })}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {state.matches('enteringDetails') && renderDetailsStep()}
      {state.matches('enteringItems') && renderItemsStep()}
      {state.matches('reviewing') && renderReviewStep()}
    </div>
  );
};
