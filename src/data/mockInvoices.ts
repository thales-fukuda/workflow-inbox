import type { InvoiceData, Event } from '../types';

interface MockInvoice {
  event: Omit<Event, 'id' | 'receivedAt'>;
  extractedData: InvoiceData;
}

export const mockInvoices: MockInvoice[] = [
  {
    event: {
      type: 'email_received',
      source: 'supplier@acme-corp.com',
      subject: 'Invoice #INV-2026-0892 - March Order',
      attachment: 'invoice_march_2026.pdf',
    },
    extractedData: {
      supplier: 'ACME Corp',
      invoiceNumber: 'INV-2026-0892',
      date: '2026-03-28',
      total: 4521.0,
      currency: 'BRL',
      lineItems: [
        { name: 'Blue Widget', sku: 'BW-001', quantity: 10, unitPrice: 150.0, isNewSku: false },
        { name: 'Red Gadget', sku: null, quantity: 5, unitPrice: 200.0, isNewSku: true },
        { name: 'Green Thing', sku: 'GT-042', quantity: 20, unitPrice: 89.0, isNewSku: false },
      ],
    },
  },
  {
    event: {
      type: 'email_received',
      source: 'orders@globex-inc.com',
      subject: 'GLOBEX Invoice #G-7821',
      attachment: 'globex_invoice_7821.pdf',
    },
    extractedData: {
      supplier: 'Globex Inc',
      invoiceNumber: 'G-7821',
      date: '2026-03-29',
      total: 12350.0,
      currency: 'BRL',
      lineItems: [
        { name: 'Quantum Capacitor', sku: 'QC-100', quantity: 50, unitPrice: 85.0, isNewSku: false },
        { name: 'Flux Compensator', sku: null, quantity: 10, unitPrice: 450.0, isNewSku: true },
        { name: 'Hyperdrive Module', sku: null, quantity: 5, unitPrice: 320.0, isNewSku: true },
        { name: 'Standard Bolt Pack', sku: 'SBP-001', quantity: 100, unitPrice: 12.0, isNewSku: false },
      ],
    },
  },
  {
    event: {
      type: 'email_received',
      source: 'invoicing@wayne-enterprises.com',
      subject: 'Wayne Ent. - PO#WE-2026-445',
      attachment: 'wayne_po_445.pdf',
    },
    extractedData: {
      supplier: 'Wayne Enterprises',
      invoiceNumber: 'WE-2026-445',
      date: '2026-03-30',
      total: 8900.0,
      currency: 'BRL',
      lineItems: [
        { name: 'Bat-Widget Pro', sku: null, quantity: 25, unitPrice: 200.0, isNewSku: true },
        { name: 'Night Vision Sensor', sku: 'NVS-007', quantity: 15, unitPrice: 260.0, isNewSku: false },
      ],
    },
  },
  {
    event: {
      type: 'email_received',
      source: 'sales@stark-industries.com',
      subject: 'Stark Industries Invoice SI-99001',
      attachment: 'stark_si99001.pdf',
    },
    extractedData: {
      supplier: 'Stark Industries',
      invoiceNumber: 'SI-99001',
      date: '2026-03-30',
      total: 25000.0,
      currency: 'BRL',
      lineItems: [
        { name: 'Arc Reactor Mini', sku: 'ARM-001', quantity: 2, unitPrice: 10000.0, isNewSku: false },
        { name: 'Repulsor Kit', sku: 'RPK-050', quantity: 10, unitPrice: 500.0, isNewSku: false },
      ],
    },
  },
];

export const getRandomMockInvoice = (): MockInvoice => {
  const index = Math.floor(Math.random() * mockInvoices.length);
  return mockInvoices[index];
};
