import type { Queue, RoleId } from '../types';

export const QUEUES: Queue[] = [
  {
    id: 'my-review',
    name: 'My Review',
    icon: '📋',
    filter: {
      states: ['review'],
    },
    roleAccess: ['admin', 'reviewer'],
  },
  {
    id: 'my-actions',
    name: 'My Actions',
    icon: '⚡',
    filter: {
      states: ['waiting_human'],
    },
    roleAccess: ['admin', 'reviewer', 'finance', 'operations'],
  },
  {
    id: 'in-progress',
    name: 'In Progress',
    icon: '🔄',
    filter: {
      states: ['running', 'waiting_external'],
    },
    roleAccess: ['admin', 'reviewer', 'finance', 'operations'],
  },
  {
    id: 'completed',
    name: 'Completed',
    icon: '✓',
    filter: {
      states: ['completed'],
    },
    roleAccess: ['admin', 'reviewer', 'finance', 'operations'],
  },
  {
    id: 'failed',
    name: 'Failed',
    icon: '⚠',
    filter: {
      states: ['failed'],
    },
    roleAccess: ['admin'],
  },
  {
    id: 'all',
    name: 'All Tasks',
    icon: '📁',
    filter: {},
    roleAccess: ['admin'],
  },
];

export const getQueuesForRole = (roleId: RoleId): Queue[] => {
  return QUEUES.filter((q) => q.roleAccess.includes(roleId));
};
