import { createMachine, assign } from 'xstate';
import type { CreateManualReceiptRequest, LineItem } from '@origen/models';

export interface ReceiptEntryContext {
  merchant: string;
  purchaseDate: string;
  currency: string;
  tax?: number;
  notes?: string;
  items: Omit<LineItem, 'id' | 'receiptId'>[];
  errors: Record<string, string>;
  currentStep: number;
  isSubmitting: boolean;
}

export type ReceiptEntryEvent =
  | { type: 'UPDATE_MERCHANT'; merchant: string }
  | { type: 'UPDATE_PURCHASE_DATE'; purchaseDate: string }
  | { type: 'UPDATE_CURRENCY'; currency: string }
  | { type: 'UPDATE_TAX'; tax: number }
  | { type: 'UPDATE_NOTES'; notes: string }
  | { type: 'ADD_ITEM'; item: Omit<LineItem, 'id' | 'receiptId'> }
  | { type: 'UPDATE_ITEM'; index: number; item: Partial<Omit<LineItem, 'id' | 'receiptId'>> }
  | { type: 'REMOVE_ITEM'; index: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SUBMIT' }
  | { type: 'RESET' }
  | { type: 'SET_ERROR'; field: string; message: string }
  | { type: 'CLEAR_ERRORS' };

export const receiptEntryMachine = createMachine({
  id: 'receiptEntry',
  initial: 'enteringDetails',
  context: {
    merchant: '',
    purchaseDate: '',
    currency: 'USD',
    tax: undefined,
    notes: '',
    items: [],
    errors: {},
    currentStep: 0,
    isSubmitting: false,
  } as ReceiptEntryContext,
  states: {
    enteringDetails: {
      on: {
        UPDATE_MERCHANT: {
          actions: assign({
            merchant: ({ event }) => event.merchant,
          }),
        },
        UPDATE_PURCHASE_DATE: {
          actions: assign({
            purchaseDate: ({ event }) => event.purchaseDate,
          }),
        },
        UPDATE_CURRENCY: {
          actions: assign({
            currency: ({ event }) => event.currency,
          }),
        },
        UPDATE_TAX: {
          actions: assign({
            tax: ({ event }) => event.tax,
          }),
        },
        UPDATE_NOTES: {
          actions: assign({
            notes: ({ event }) => event.notes,
          }),
        },
        NEXT_STEP: {
          target: 'enteringItems',
          guard: ({ context }) => {
            return context.merchant.trim() !== '' && context.purchaseDate !== '';
          },
        },
        SET_ERROR: {
          actions: assign({
            errors: ({ context, event }) => ({
              ...context.errors,
              [event.field]: event.message,
            }),
          }),
        },
        CLEAR_ERRORS: {
          actions: assign({
            errors: {},
          }),
        },
      },
    },
    enteringItems: {
      on: {
        ADD_ITEM: {
          actions: assign({
            items: ({ context, event }) => [...context.items, event.item],
          }),
        },
        UPDATE_ITEM: {
          actions: assign({
            items: ({ context, event }) => {
              const newItems = [...context.items];
              newItems[event.index] = { ...newItems[event.index], ...event.item };
              return newItems;
            },
          }),
        },
        REMOVE_ITEM: {
          actions: assign({
            items: ({ context, event }) => {
              const newItems = [...context.items];
              newItems.splice(event.index, 1);
              return newItems;
            },
          }),
        },
        PREVIOUS_STEP: {
          target: 'enteringDetails',
        },
        NEXT_STEP: {
          target: 'reviewing',
          guard: ({ context }) => {
            return context.items.length > 0 && context.items.every(item => 
              item.description.trim() !== '' && 
              item.quantity > 0 && 
              item.unitPrice > 0 && 
              item.total > 0
            );
          },
        },
        SET_ERROR: {
          actions: assign({
            errors: ({ context, event }) => ({
              ...context.errors,
              [event.field]: event.message,
            }),
          }),
        },
        CLEAR_ERRORS: {
          actions: assign({
            errors: {},
          }),
        },
      },
    },
    reviewing: {
      on: {
        PREVIOUS_STEP: {
          target: 'enteringItems',
        },
        SUBMIT: {
          target: 'saving',
          actions: assign({
            isSubmitting: true,
          }),
        },
      },
    },
    saving: {
      on: {
        SUBMIT_SUCCESS: {
          target: 'done',
          actions: assign({
            isSubmitting: false,
          }),
        },
        SUBMIT_ERROR: {
          target: 'error',
          actions: assign({
            isSubmitting: false,
          }),
        },
      },
    },
    done: {
      on: {
        RESET: {
          target: 'enteringDetails',
          actions: assign({
            merchant: '',
            purchaseDate: '',
            currency: 'USD',
            tax: undefined,
            notes: '',
            items: [],
            errors: {},
            currentStep: 0,
            isSubmitting: false,
          }),
        },
      },
    },
    error: {
      on: {
        RESET: {
          target: 'enteringDetails',
          actions: assign({
            merchant: '',
            purchaseDate: '',
            currency: 'USD',
            tax: undefined,
            notes: '',
            items: [],
            errors: {},
            currentStep: 0,
            isSubmitting: false,
          }),
        },
        PREVIOUS_STEP: {
          target: 'reviewing',
        },
      },
    },
  },
});

export const getReceiptDataFromContext = (context: ReceiptEntryContext): CreateManualReceiptRequest => {
  return {
    merchant: context.merchant,
    purchaseDate: new Date(context.purchaseDate).toISOString(),
    currency: context.currency as any,
    tax: context.tax,
    notes: context.notes,
    items: context.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) || 0 : item.unitPrice,
      total: item.total,
    })),
  };
};
