# GlobGlob - Agent Development Guide

> This document enables AI agents and developers to work on this codebase effectively out of the box.

**IMPORTANT FOR AGENTS**: Keep this documentation up to date. After making code changes, review and update relevant sections of CLAUDE.md, README.md, and CONTRIBUTING.md if your changes affect project structure, APIs, types, workflows, or add new features.

## Quick Reference

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm test             # Run tests (must pass before commit)
npm run lint         # Lint code (must pass before commit)
npm run build        # Build for production
```

## Project Overview

**GlobGlob** is an AI-powered workflow automation platform with human-in-the-loop review capabilities. It supports customizable workflows, role-based task routing, and simulation for testing.

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
5. **Update documentation** if needed (see below)

### Updating Documentation

**After making changes, update docs if you:**
- Add/remove/rename files → Update "Project Structure" section
- Add new types or modify existing → Update "Key Types" section
- Add new components → Add to structure, add "Common Tasks" if pattern is reusable
- Change API endpoints → Update API section
- Add new scripts/commands → Update "Quick Reference" and scripts table
- Add new environment variables → Update environment table
- Change CI/CD workflow → Update "CI/CD Pipeline" section
- Add new AWS resources → Update "AWS Resources" table
- Discover new troubleshooting issues → Add to "Troubleshooting"

**Files to update:**
| Change Type | Update |
|-------------|--------|
| New feature | CLAUDE.md (structure, types, tasks), README.md (features) |
| API change | CLAUDE.md (API section) |
| New script | CLAUDE.md (Quick Reference), README.md (Scripts table) |
| Infra change | CLAUDE.md (AWS Resources) |
| Bug fix with learnings | CLAUDE.md (Troubleshooting) |

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
│   │   ├── Header.tsx          # App header with role switcher
│   │   ├── Sidebar.tsx         # Queue navigation
│   │   ├── TaskList.tsx        # Task list by queue
│   │   ├── TaskDetail.tsx      # Full task view with actions
│   │   ├── ReviewForm.tsx      # Data review forms (invoice, PR)
│   │   ├── ActionForm.tsx      # Human action forms
│   │   ├── WorkflowProgress.tsx # Step progress indicator
│   │   ├── SimulationPanel.tsx # Mock task creation & external actions
│   │   └── LanguageSwitcher.tsx
│   ├── store/                  # Zustand state management
│   │   ├── taskStore.ts        # Task state, execution, filtering
│   │   └── roleStore.ts        # Role management
│   ├── services/               # External API integrations
│   │   └── eanService.ts       # EAN validation + Open Food Facts
│   ├── types/                  # TypeScript type definitions
│   │   ├── index.ts            # All shared types
│   │   └── index.test.ts       # Type tests
│   ├── i18n/                   # Internationalization
│   │   ├── translations.ts     # EN + PT-BR strings
│   │   └── LanguageContext.tsx # Language provider
│   ├── data/                   # Static/configuration data
│   │   ├── workflows.ts        # Workflow definitions (steps, config)
│   │   └── queues.ts           # Queue definitions (filters, access)
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
import type { Task, Workflow, WorkflowStep } from '../types';

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
// Follow existing pattern in taskStore.ts
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

### Task
```typescript
interface Task {
  id: string;
  workflowId: string;
  title: string;
  state: TaskState;  // created | review | running | waiting_human | waiting_external | paused | completed | failed | cancelled
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  data: Record<string, unknown>;
  currentStepId: string | null;
  stepExecutions: StepExecution[];
  assignedTo?: RoleId;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  triggeredBy: string;
}
```

### Workflow
```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  triggerType: 'email' | 'manual' | 'schedule' | 'webhook';
  requiresReview: boolean;
  steps: WorkflowStep[];
}
```

### WorkflowStep
```typescript
interface WorkflowStep {
  id: string;
  type: StepType;  // ai_skill | connector | human | review | condition
  name: string;
  description?: string;
  config: Record<string, unknown>;
  assignTo?: RoleId;
  condition?: string;
  thenStep?: string;
  elseStep?: string;
}
```

### InvoiceData (for demo workflows)
```typescript
interface InvoiceData {
  supplier: string;
  supplierTaxId?: string;
  invoiceNumber: string;
  date: string;
  currency: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
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
- Example: `src/types/index.ts` → `src/types/index.test.ts`

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

---

## Documentation Maintenance

> **CRITICAL**: Documentation must stay in sync with code. Outdated docs cause confusion and errors for future agents and developers.

### When to Update Docs

**Always update documentation when you:**

| Change | Files to Update |
|--------|-----------------|
| Add new component | CLAUDE.md (Project Structure) |
| Add new type/interface | CLAUDE.md (Key Types) |
| Add new store/action | CLAUDE.md (Coding Conventions - Zustand) |
| Add new API endpoint | CLAUDE.md (API section if exists) |
| Add new script | CLAUDE.md (Quick Reference), README.md |
| Add new translation keys | Note pattern in CLAUDE.md if new |
| Change project structure | CLAUDE.md, README.md |
| Add AWS resource | CLAUDE.md (AWS Resources table) |
| Fix tricky bug | CLAUDE.md (Troubleshooting) |
| Change CI/CD | CLAUDE.md (CI/CD Pipeline) |
| Add new dependency | README.md (Tech Stack) if significant |

### Documentation Files

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `CLAUDE.md` | Agent/developer guide, technical details | Every significant change |
| `README.md` | Project overview, quick start | New features, structure changes |
| `CONTRIBUTING.md` | Quick contribution checklist | Workflow changes |

### Example: Adding a New Feature

If you add a new "Reports" feature:

1. **Code changes**: Add components, store, types
2. **CLAUDE.md updates**:
   - Add to Project Structure (new files)
   - Add ReportData type to Key Types
   - Add "Creating a Report" to Common Tasks
3. **README.md updates**:
   - Add "Reports" to Features list
4. **Commit message**:
   ```
   feat: Add reports feature with PDF export
   
   - ReportsView component for viewing reports
   - reportStore for state management
   - PDF generation service
   - Updated CLAUDE.md and README.md
   
   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

### Self-Check Before Commit

Ask yourself:
1. Did I add new files? → Update Project Structure
2. Did I add new types? → Update Key Types
3. Did I add new commands/scripts? → Update Quick Reference
4. Did I learn something tricky? → Add to Troubleshooting
5. Would another agent be confused? → Add clarification

### Keeping Docs Concise

- Don't document obvious code
- Focus on "why" and "how to use", not "what it does"
- Use tables for reference data
- Use code blocks for examples
- Keep troubleshooting actionable (problem → solution)
