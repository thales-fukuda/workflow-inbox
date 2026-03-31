# GlobGlob - Agent Development Guide

> This document enables AI agents and developers to work on this codebase effectively out of the box.

## Quick Reference

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm test             # Run tests (must pass before commit)
npm run lint         # Lint code (must pass before commit)
npm run build        # Build for production
```

## Project Overview

**GlobGlob** is an AI-powered invoice processing platform for e-commerce operations.

| Component | Technology | Location |
|-----------|------------|----------|
| Frontend | React 18 + TypeScript + Vite | `src/` |
| Styling | Tailwind CSS | `src/index.css` |
| State | Zustand (localStorage persist) | `src/store/` |
| Backend | AWS Lambda (Node.js 20.x) | `lambda/` |
| AI | AWS Bedrock (Claude Haiku) | `lambda/index.mjs` |
| Infra | AWS CDK v2 | `infra/` |
| CI/CD | GitHub Actions | `.github/workflows/` |

**Live URL**: http://workflow-inbox-1774912847.s3-website-us-east-1.amazonaws.com

---

## Code Change Workflow

### Before Making Changes

1. **Pull latest**: `git pull origin main`
2. **Install deps**: `npm install`
3. **Verify clean state**: `npm test && npm run lint`

### Making Changes

1. **Edit code** following conventions below
2. **Run tests**: `npm test`
3. **Run lint**: `npm run lint`
4. **Fix any errors** before committing

### Committing Changes

**Commit message format:**
```
<type>: <short description>

<optional body explaining why>

Co-Authored-By: <agent-name> <noreply@anthropic.com>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `docs`: Documentation only
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, CI/CD

**Examples:**
```bash
# Feature
git commit -m "feat: Add product search by category

Co-Authored-By: Claude <noreply@anthropic.com>"

# Bug fix
git commit -m "fix: Resolve EAN validation for 8-digit codes

Co-Authored-By: Claude <noreply@anthropic.com>"

# Refactor
git commit -m "refactor: Extract invoice parsing to separate service

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### After Committing

1. **Push**: `git push origin main`
2. **CI/CD automatically**:
   - Runs tests
   - Runs lint
   - Deploys to AWS (if on main branch)
3. **Monitor**: `gh run list --limit 1`

---

## Project Structure

```
globglob/
├── src/                        # Frontend source code
│   ├── components/             # React components
│   │   ├── Inbox.tsx           # Main workflow list
│   │   ├── WorkflowDetail.tsx  # Workflow detail + editing
│   │   ├── WorkflowCard.tsx    # List item card
│   │   ├── ProductCatalog.tsx  # Product database view
│   │   ├── EanSearchModal.tsx  # EAN lookup/entry modal
│   │   ├── UploadModal.tsx     # Invoice upload
│   │   └── LanguageSwitcher.tsx
│   ├── store/                  # Zustand state management
│   │   ├── workflowStore.ts    # Workflow state + actions
│   │   └── productStore.ts     # Product catalog (persisted)
│   ├── services/               # External API integrations
│   │   └── eanService.ts       # EAN validation + Open Food Facts
│   ├── types/                  # TypeScript type definitions
│   │   ├── index.ts            # All shared types
│   │   └── index.test.ts       # Type tests
│   ├── i18n/                   # Internationalization
│   │   ├── translations.ts     # EN + PT-BR strings
│   │   └── LanguageContext.tsx # Language provider
│   ├── data/                   # Static/mock data
│   │   ├── mockInvoices.ts     # Sample invoice data
│   │   └── skills.ts           # Workflow skill definitions
│   ├── utils/                  # Utility functions
│   │   └── formatTime.ts       # Date/currency formatting
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind + custom styles
├── lambda/                     # AWS Lambda functions
│   └── index.mjs               # Invoice extraction handler
├── infra/                      # AWS CDK infrastructure
│   ├── bin/app.ts              # CDK app entry
│   └── lib/
│       ├── globglob-stack.ts   # Main infrastructure
│       └── github-oidc-stack.ts # CI/CD IAM roles
├── scripts/                    # Shell scripts
│   ├── build.sh                # Build all
│   ├── test.sh                 # Run tests
│   ├── deploy.sh               # CDK deploy
│   ├── deploy-manual.sh        # Manual AWS CLI deploy
│   └── setup-github-oidc.sh    # One-time CI/CD setup
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions CI/CD
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
└── CLAUDE.md                   # This file
```

---

## Coding Conventions

### TypeScript

```typescript
// Use explicit types for function parameters and returns
function calculateTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

// Use `import type` for type-only imports (required for build)
import type { WorkflowInstance, LineItem } from '../types';

// Prefer interfaces over type aliases for objects
interface Product {
  id: string;
  ean: string;
  name: string;
}

// Use const assertions for literal types
const STATUS = ['pending', 'running', 'completed'] as const;
type Status = typeof STATUS[number];
```

### React Components

```typescript
// Functional components with explicit props interface
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button = ({ onClick, disabled = false, children }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
    >
      {children}
    </button>
  );
};
```

### Zustand Stores

```typescript
// Follow existing pattern in workflowStore.ts
interface MyStore {
  // State
  items: Item[];
  selectedId: string | null;
  
  // Actions
  addItem: (item: Item) => void;
  selectItem: (id: string | null) => void;
}

export const useMyStore = create<MyStore>((set, get) => ({
  items: [],
  selectedId: null,
  
  addItem: (item) => set(state => ({
    items: [...state.items, item],
  })),
  
  selectItem: (id) => set({ selectedId: id }),
}));
```

### Tailwind CSS

```typescript
// Use consistent spacing and color patterns
// Colors: slate (neutral), indigo (primary), green (success), red (error), amber (warning)
// Spacing: 1, 2, 3, 4, 6, 8 (avoid odd numbers)
// Dark mode: Always include dark: variants

<div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
    Title
  </h2>
  <p className="text-sm text-slate-500 dark:text-slate-400">
    Description
  </p>
</div>
```

### Translations

```typescript
// Always add both EN and PT-BR
// In src/i18n/translations.ts:
export const translations = {
  en: {
    myNewKey: 'English text',
  },
  'pt-BR': {
    myNewKey: 'Texto em portugues',
  },
} as const;

// Usage in components:
const { t } = useLanguage();
<span>{t('myNewKey')}</span>
```

---

## Key Types

### LineItem
```typescript
interface LineItem {
  id: string;
  name: string;
  supplierCode: string | null;
  quantity: number;
  unitPrice: number;
  ean: string | null;
  eanStatus: 'resolved' | 'suggested' | 'manual' | 'unknown';
  eanSource: 'extracted' | 'mapping' | 'database' | 'user' | null;
  isEdited: boolean;
  isNewProduct: boolean;
}
```

### InvoiceData
```typescript
interface InvoiceData {
  supplier: string;
  supplierCode?: string;
  invoiceNumber: string;
  date: string;
  total: number;
  currency: string;
  lineItems: LineItem[];
  hasUnresolvedEans: boolean;
  isEdited: boolean;
}
```

### WorkflowInstance
```typescript
interface WorkflowInstance {
  id: string;
  workflowType: 'invoice_processing' | 'inventory_sync' | 'financial_report';
  status: 'pending_approval' | 'approved' | 'running' | 'completed' | 'failed';
  event: Event;
  extractedData?: InvoiceData;
  tasks: Task[];
  currentTaskIndex: number;
  createdAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  maxRetries: number;
}
```

---

## Common Tasks

### Add a New Component

1. Create file in `src/components/MyComponent.tsx`
2. Follow existing component patterns
3. Add translations if needed
4. Import in parent component

### Add a New Store Action

1. Add to interface in store file
2. Implement in `create()` callback
3. Use in components with `useMyStore()`

### Add a New API Endpoint

1. Edit `lambda/index.mjs`
2. Add route handling
3. Update `infra/lib/globglob-stack.ts` if new resource needed
4. Deploy with `./scripts/deploy.sh`

### Add a New Translation

1. Edit `src/i18n/translations.ts`
2. Add key to both `en` and `pt-BR`
3. Use with `t('keyName')`

### Modify CDK Infrastructure

1. Edit `infra/lib/globglob-stack.ts`
2. Preview: `cd infra && npx cdk diff`
3. Deploy: `./scripts/deploy.sh`

---

## Testing

### Run Tests
```bash
npm test                              # Run all tests
npm test -- --watch                   # Watch mode
npm test -- src/store/workflowStore   # Specific file
```

### Test File Naming
- `*.test.ts` or `*.test.tsx` next to source file
- Example: `src/store/workflowStore.ts` → `src/store/workflowStore.test.ts`

### Writing Tests
```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('MyFeature', () => {
  beforeEach(() => {
    // Reset state
  });

  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

---

## CI/CD Pipeline

**Trigger**: Every push to `main` branch

**Jobs**:
1. **Test**: Install → Test → Lint
2. **Deploy**: Build → CDK Deploy (only on main, after tests pass)

**Files**:
- `.github/workflows/deploy.yml` - Workflow definition
- `infra/lib/github-oidc-stack.ts` - IAM role for GitHub

**Monitor**:
```bash
gh run list --limit 5        # List recent runs
gh run view <id>             # View specific run
gh run view <id> --log-failed # View failure logs
```

---

## Troubleshooting

### Build Fails

```bash
# Check TypeScript errors
npm run build

# Common fixes:
# 1. Use `import type` for type-only imports
# 2. Check for missing dependencies
# 3. Ensure all translations have both languages
```

### Lint Fails

```bash
npm run lint

# Common issues:
# 1. Unused variables → remove or prefix with _
# 2. Missing dependencies in useEffect → add to array
# 3. react-refresh warning → add eslint-disable comment
```

### Tests Fail

```bash
npm test

# Debug specific test:
npm test -- --reporter=verbose src/store/workflowStore.test.ts
```

### Deploy Fails

```bash
# Check CI logs
gh run view <id> --log-failed

# Common issues:
# 1. AWS credentials not configured
# 2. CDK not bootstrapped → cd infra && npx cdk bootstrap
# 3. IAM permissions missing
```

### Bedrock Model Access Denied

- Model ID: `us.anthropic.claude-haiku-4-5-20251001-v1:0`
- Enable in AWS Bedrock console
- Check Lambda IAM role has `bedrock:InvokeModel`

---

## AWS Resources

| Resource | Name/ID | Purpose |
|----------|---------|---------|
| S3 Bucket | workflow-inbox-1774912847 | Static website |
| Lambda | workflow-invoice-extractor | Invoice extraction |
| API Gateway | GlobGlob Invoice API | REST API |
| IAM Role | GlobGlob-GitHubActions-DeployRole | CI/CD |
| Region | us-east-1 | All resources |

---

## Git Commands Reference

```bash
# Check status
git status

# Stage all changes
git add -A

# Commit with message
git commit -m "type: description

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to main
git push origin main

# View recent commits
git log --oneline -10

# Check CI status
gh run list --limit 3
```

---

## Environment Setup

### Prerequisites
- Node.js 20+
- npm 9+
- AWS CLI configured
- GitHub CLI (`gh`) authenticated

### First Time Setup
```bash
git clone https://github.com/thales-fukuda/workflow-inbox.git
cd workflow-inbox
npm install
npm run dev
```

### CI/CD Setup (One-Time)
```bash
./scripts/setup-github-oidc.sh
# Follow output instructions to add GitHub secret
```
