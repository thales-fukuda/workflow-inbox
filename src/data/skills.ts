import type { Skill } from '../types';

export const skills: Record<string, Skill> = {
  parse_invoice: {
    id: 'parse_invoice',
    name: 'Parse Invoice',
    description: 'Extract data from invoice PDF using AI',
    estimatedDuration: 2000,
  },
  check_sku_exists: {
    id: 'check_sku_exists',
    name: 'Check SKU Exists',
    description: 'Verify if SKU exists in the catalog',
    estimatedDuration: 500,
  },
  create_sku: {
    id: 'create_sku',
    name: 'Create SKU',
    description: 'Register new SKU in catalog, pricing, and marketplace',
    estimatedDuration: 3000,
  },
  register_invoice: {
    id: 'register_invoice',
    name: 'Register Invoice',
    description: 'Register invoice in the financial system',
    estimatedDuration: 1500,
  },
  update_inventory: {
    id: 'update_inventory',
    name: 'Update Inventory',
    description: 'Update inventory quantities based on invoice',
    estimatedDuration: 1000,
  },
};

export const getSkill = (id: string): Skill | undefined => skills[id];
