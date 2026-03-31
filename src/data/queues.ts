import type { Queue, RoleId } from '../types';

export const QUEUES: Queue[] = [
  {
    id: 'my-review',
    name: 'My Review',
    icon: 'clipboard',
    filter: {
      states: ['review'],
    },
    roleAccess: ['admin', 'reviewer'],
  },
  {
    id: 'my-actions',
    name: 'My Actions',
    icon: 'bolt',
    filter: {
      states: ['waiting_human'],
    },
    roleAccess: ['admin', 'reviewer', 'finance', 'operations'],
  },
  {
    id: 'in-progress',
    name: 'In Progress',
    icon: 'refresh',
    filter: {
      states: ['running', 'waiting_external'],
    },
    roleAccess: ['admin', 'reviewer', 'finance', 'operations'],
  },
  {
    id: 'completed',
    name: 'Completed',
    icon: 'check-circle',
    filter: {
      states: ['completed'],
    },
    roleAccess: ['admin', 'reviewer', 'finance', 'operations'],
  },
  {
    id: 'failed',
    name: 'Failed',
    icon: 'warning',
    filter: {
      states: ['failed'],
    },
    roleAccess: ['admin'],
  },
  {
    id: 'all',
    name: 'All Tasks',
    icon: 'folder',
    filter: {},
    roleAccess: ['admin'],
  },
];

export const getQueuesForRole = (roleId: RoleId): Queue[] => {
  return QUEUES.filter((q) => q.roleAccess.includes(roleId));
};
