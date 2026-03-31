import type { InvoiceData, Event } from '../types';

interface MockInvoice {
  event: Omit<Event, 'id' | 'receivedAt'>;
  extractedData: InvoiceData;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

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
      supplierCode: '12345678000100',
      invoiceNumber: 'INV-2026-0892',
      date: '2026-03-28',
      total: 4521.0,
      currency: 'BRL',
      lineItems: [
        { id: generateId(), name: 'Blue Widget', supplierCode: 'BW-001', quantity: 10, unitPrice: 150.0, ean: '7891234567890', eanStatus: 'resolved', eanSource: 'extracted', isEdited: false, isNewProduct: false },
        { id: generateId(), name: 'Red Gadget', supplierCode: 'RG-002', quantity: 5, unitPrice: 200.0, ean: null, eanStatus: 'unknown', eanSource: null, isEdited: false, isNewProduct: true },
        { id: generateId(), name: 'Green Thing', supplierCode: 'GT-042', quantity: 20, unitPrice: 89.0, ean: '7898765432100', eanStatus: 'resolved', eanSource: 'extracted', isEdited: false, isNewProduct: false },
      ],
      hasUnresolvedEans: true,
      isEdited: false,
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
      supplierCode: '98765432000100',
      invoiceNumber: 'G-7821',
      date: '2026-03-29',
      total: 12350.0,
      currency: 'BRL',
      lineItems: [
        { id: generateId(), name: 'Quantum Capacitor', supplierCode: 'QC-100', quantity: 50, unitPrice: 85.0, ean: '7891111111111', eanStatus: 'resolved', eanSource: 'extracted', isEdited: false, isNewProduct: false },
        { id: generateId(), name: 'Flux Compensator', supplierCode: 'FC-200', quantity: 10, unitPrice: 450.0, ean: null, eanStatus: 'unknown', eanSource: null, isEdited: false, isNewProduct: true },
        { id: generateId(), name: 'Hyperdrive Module', supplierCode: 'HM-300', quantity: 5, unitPrice: 320.0, ean: null, eanStatus: 'unknown', eanSource: null, isEdited: false, isNewProduct: true },
        { id: generateId(), name: 'Standard Bolt Pack', supplierCode: 'SBP-001', quantity: 100, unitPrice: 12.0, ean: '7892222222222', eanStatus: 'resolved', eanSource: 'mapping', isEdited: false, isNewProduct: false },
      ],
      hasUnresolvedEans: true,
      isEdited: false,
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
      supplierCode: '55555555000100',
      invoiceNumber: 'WE-2026-445',
      date: '2026-03-30',
      total: 8900.0,
      currency: 'BRL',
      lineItems: [
        { id: generateId(), name: 'Bat-Widget Pro', supplierCode: 'BWP-001', quantity: 25, unitPrice: 200.0, ean: null, eanStatus: 'unknown', eanSource: null, isEdited: false, isNewProduct: true },
        { id: generateId(), name: 'Night Vision Sensor', supplierCode: 'NVS-007', quantity: 15, unitPrice: 260.0, ean: '7893333333333', eanStatus: 'resolved', eanSource: 'extracted', isEdited: false, isNewProduct: false },
      ],
      hasUnresolvedEans: true,
      isEdited: false,
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
      supplierCode: '44444444000100',
      invoiceNumber: 'SI-99001',
      date: '2026-03-30',
      total: 25000.0,
      currency: 'BRL',
      lineItems: [
        { id: generateId(), name: 'Arc Reactor Mini', supplierCode: 'ARM-001', quantity: 2, unitPrice: 10000.0, ean: '7894444444444', eanStatus: 'resolved', eanSource: 'extracted', isEdited: false, isNewProduct: false },
        { id: generateId(), name: 'Repulsor Kit', supplierCode: 'RPK-050', quantity: 10, unitPrice: 500.0, ean: '7895555555555', eanStatus: 'resolved', eanSource: 'mapping', isEdited: false, isNewProduct: false },
      ],
      hasUnresolvedEans: false,
      isEdited: false,
    },
  },
];

export const getRandomMockInvoice = (): MockInvoice => {
  const index = Math.floor(Math.random() * mockInvoices.length);
  return mockInvoices[index];
};
