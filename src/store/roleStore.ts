import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, RoleId } from '../types';

// ----------------------------------------------------------------------------
// Role Definitions
// ----------------------------------------------------------------------------

export const ROLES: Record<RoleId, Role> = {
  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all tasks and settings',
    color: '#6366f1',
  },
  reviewer: {
    id: 'reviewer',
    name: 'Reviewer',
    description: 'Reviews and approves incoming tasks',
    color: '#0891b2',
  },
  finance: {
    id: 'finance',
    name: 'Finance Manager',
    description: 'Handles financial approvals and verifications',
    color: '#059669',
  },
  operations: {
    id: 'operations',
    name: 'Operations',
    description: 'Manages operational tasks and verifications',
    color: '#d97706',
  },
};

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

interface RoleStore {
  currentRole: RoleId;
  setRole: (role: RoleId) => void;
  getRole: () => Role;
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set, get) => ({
      currentRole: 'admin',

      setRole: (role) => set({ currentRole: role }),

      getRole: () => ROLES[get().currentRole],
    }),
    {
      name: 'globglob-role',
    }
  )
);
