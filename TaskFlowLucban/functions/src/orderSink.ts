import type { DocumentReference, DocumentData, Transaction } from 'firebase-admin/firestore';

export interface OrderSink {
  create(transaction: Transaction, reference: DocumentReference, order: DocumentData): void;
  update(transaction: Transaction, reference: DocumentReference, changes: DocumentData): void;
}

export const firestoreOrderSink: OrderSink = {
  create: (transaction, reference, order) => transaction.create(reference, order),
  update: (transaction, reference, changes) => transaction.update(reference, changes),
};
