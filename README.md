# Workflow Inbox

An AI-powered task orchestration platform that automates repetitive business processes through a library of skills, with human-in-the-loop approval controls.

**Live Demo:** http://workflow-inbox-1774912847.s3-website-us-east-1.amazonaws.com

## Overview

Workflow Inbox transforms how teams handle repetitive operational tasks. Instead of building custom tools for each process, it provides a unified interface where:

1. **Events trigger workflows** (e.g., supplier invoice arrives via email)
2. **AI extracts relevant data** (parses invoice, identifies products)
3. **System plans actions** (register SKUs, update inventory, record invoice)
4. **Humans approve or adjust** (review before execution)
5. **Skills execute automatically** (integrations run the actual work)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     EVENT       │────▶│   AI PLANNING   │────▶│   SKILL EXEC    │
│  (Invoice PDF)  │     │  (Extract Data) │     │  (Register SKU) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │ HUMAN APPROVAL  │
                        │  (Review & OK)  │
                        └─────────────────┘
```

## Current State (MVP)

### Features

| Feature | Status | Description |
|---------|--------|-------------|
| Invoice Upload | Done | Upload PDF, XML (NFe), or images |
| AI Data Extraction | Done | Claude 3.5 Haiku extracts structured data |
| Workflow Inbox | Done | View pending, running, completed, failed workflows |
| Task Planning | Done | Auto-generates tasks based on extracted data |
| Approval Flow | Done | Approve/reject workflows before execution |
| Mock Execution | Done | Simulates skill execution with progress |
| Failure Handling | Done | Retry failed workflows, DLQ for investigation |
| i18n | Done | Portuguese (BR) and English |
| Responsive UI | Done | Works on desktop and mobile |
| Dark Mode | Done | Automatic based on system preference |

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)

**Backend:**
- AWS Lambda (serverless functions)
- AWS API Gateway (HTTP API)
- AWS Bedrock (Claude 3.5 Haiku for AI)
- AWS S3 (static hosting)

### Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Inbox   │  │  Upload  │  │  Detail  │  │  Language Toggle │   │
│  │  View    │  │  Modal   │  │  View    │  │  (PT-BR / EN)    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
│                       │                                             │
│                       │ Zustand Store                               │
│                       ▼                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  WorkflowStore: workflows[], selectedId, actions            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                         AWS BACKEND                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐ │
│  │ API Gateway  │───▶│    Lambda    │───▶│  Bedrock (Claude)    │ │
│  │ /extract-    │    │  invoice-    │    │  3.5 Haiku           │ │
│  │  invoice     │    │  extractor   │    │                      │ │
│  └──────────────┘    └──────────────┘    └──────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 20+
- AWS CLI configured with appropriate permissions
- AWS account with Bedrock access (Claude models enabled)

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/workflow-inbox.git
cd workflow-inbox

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Environment Setup

The frontend calls the AWS API Gateway endpoint for invoice extraction. Update the API endpoint in `src/components/UploadModal.tsx` if deploying your own backend:

```typescript
const API_ENDPOINT = 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/extract-invoice';
```

## Project Structure

```
workflow-inbox/
├── src/
│   ├── components/
│   │   ├── Inbox.tsx           # Main workflow list
│   │   ├── WorkflowCard.tsx    # Individual workflow card
│   │   ├── WorkflowDetail.tsx  # Detailed view with tasks
│   │   ├── UploadModal.tsx     # Invoice upload dialog
│   │   └── LanguageSwitcher.tsx
│   ├── store/
│   │   └── workflowStore.ts    # Zustand state management
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── i18n/
│   │   ├── translations.ts     # PT-BR and EN strings
│   │   └── LanguageContext.tsx
│   ├── data/
│   │   ├── skills.ts           # Skill definitions
│   │   └── mockInvoices.ts     # Sample data for simulation
│   └── utils/
│       └── formatTime.ts       # Time/currency formatters
├── lambda/
│   ├── index.mjs               # Invoice extraction Lambda
│   ├── policy.json             # IAM policy
│   └── trust-policy.json       # Lambda trust policy
├── AGENT.md                    # AI agent documentation
└── README.md                   # This file
```

## Usage

### Uploading an Invoice

1. Click **"Enviar Nota Fiscal"** (Upload Invoice)
2. Drag & drop or select a file:
   - **PDF** - Invoice documents
   - **XML** - Brazilian NFe/NFSe electronic invoices
   - **Images** - Photos or scans of invoices
3. Wait for AI extraction (~3-5 seconds)
4. Review extracted data (supplier, items, totals)
5. Click **"Criar Fluxo"** (Create Workflow)

### Managing Workflows

- **Pending Approval**: Review and approve/reject
- **Running**: Watch progress as tasks execute
- **Needs Attention**: Failed workflows to retry or dismiss
- **Completed**: Audit trail of finished work

### Simulating (Demo Mode)

Click **"Simular Email"** to create a workflow with random mock data. Useful for testing the approval flow without real invoices.

## Future Vision

See [AGENT.md](./AGENT.md) for detailed documentation on the AI agent architecture and future roadmap including:

- **Skill Library**: Extensible library of business process automations
- **Skill Studio**: AI-assisted skill creation by non-developers
- **Event-Driven Triggers**: Email, webhooks, scheduled jobs
- **Smart Automation**: Auto-approval rules, learning from corrections

## Data Models

### WorkflowInstance

```typescript
interface WorkflowInstance {
  id: string;
  workflowType: 'invoice_processing' | 'inventory_sync' | 'financial_report';
  status: 'pending_approval' | 'approved' | 'running' | 'completed' | 'failed';
  event: Event;
  extractedData?: InvoiceData;
  tasks: Task[];
  createdAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  retryCount: number;
}
```

### Skill

```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number;
  execute?: (params: unknown) => Promise<unknown>;
}
```

## AWS Resources

| Resource | Name/ID |
|----------|---------|
| S3 Bucket | `workflow-inbox-1774912847` |
| Lambda | `workflow-invoice-extractor` |
| API Gateway | `ypfygomzx5` |
| IAM Role | `workflow-invoice-lambda-role` |

### Cleanup Commands

```bash
aws s3 rb s3://workflow-inbox-1774912847 --force
aws lambda delete-function --function-name workflow-invoice-extractor
aws apigatewayv2 delete-api --api-id ypfygomzx5
aws iam delete-role-policy --role-name workflow-invoice-lambda-role --policy-name bedrock-invoke-policy
aws iam delete-role --role-name workflow-invoice-lambda-role
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built with [Claude](https://anthropic.com) AI assistance
- UI inspired by [Linear](https://linear.app) and [Retool Workflows](https://retool.com/products/workflows)
