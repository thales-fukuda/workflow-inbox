# GlobGlob

AI-powered invoice processing and task orchestration platform for e-commerce operations.

**Live Demo**: http://workflow-inbox-1774912847.s3-website-us-east-1.amazonaws.com

## Features

- **AI Invoice Extraction**: Upload PDF, XML (NFe), or image invoices and automatically extract structured data using AWS Bedrock (Claude Haiku)
- **EAN/GTIN Resolution**: Link all products to universal EAN barcodes with multi-source lookup (invoice, mapping, database, manual)
- **Editable Review**: Edit extracted data before approval with human-in-the-loop controls
- **Product Catalog**: Persistent database of products and supplier mappings
- **Workflow Automation**: Automated task execution after approval (inventory, financial systems)
- **Multi-language**: English and Portuguese (Brazil) support

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Deployment

### Prerequisites

- AWS CLI configured with credentials
- Node.js 20+
- npm 9+

### Deploy with CDK (Recommended)

```bash
# First time: bootstrap CDK (one-time per account/region)
cd infra && npx cdk bootstrap && cd ..

# Deploy everything
./scripts/deploy.sh
```

### Manual Deployment

```bash
# Deploy to existing AWS resources
export LAMBDA_NAME=workflow-invoice-extractor
export S3_BUCKET=workflow-inbox-1774912847
./scripts/deploy-manual.sh
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│  API Gateway    │────▶│    Lambda       │
│   (S3 Static)   │     │                 │     │  (Extractor)    │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  AWS Bedrock    │
                                                │  (Claude Haiku) │
                                                └─────────────────┘
```

## Project Structure

```
├── src/                 # React frontend
│   ├── components/      # UI components
│   │   ├── Inbox.tsx           # Workflow list view
│   │   ├── WorkflowDetail.tsx  # Editable workflow detail
│   │   ├── ProductCatalog.tsx  # Product/mapping catalog
│   │   ├── EanSearchModal.tsx  # EAN lookup modal
│   │   └── UploadModal.tsx     # Invoice upload
│   ├── store/           # Zustand state stores
│   │   ├── workflowStore.ts    # Workflow state & actions
│   │   └── productStore.ts     # Product catalog (localStorage)
│   ├── services/        # External API services
│   │   └── eanService.ts       # EAN validation & Open Food Facts
│   ├── types/           # TypeScript types
│   └── i18n/            # Translations
├── lambda/              # AWS Lambda functions
│   └── index.mjs        # Invoice extraction with Bedrock
├── infra/               # AWS CDK infrastructure
│   ├── lib/globglob-stack.ts   # CDK stack definition
│   └── bin/app.ts              # CDK app entry
├── scripts/             # Build & deploy scripts
│   ├── build.sh         # Build frontend + CDK
│   ├── test.sh          # Run tests
│   ├── deploy.sh        # CDK deployment
│   └── deploy-manual.sh # AWS CLI deployment
└── CLAUDE.md            # Agent context file
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand
- **Backend**: AWS Lambda (Node.js 20.x), API Gateway
- **AI**: AWS Bedrock (Claude Haiku 4.5)
- **Infrastructure**: AWS CDK v2, S3, IAM
- **Testing**: Vitest

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at localhost:5173 |
| `npm run build` | Build for production |
| `npm test` | Run tests with Vitest |
| `npm run lint` | Lint with ESLint |
| `./scripts/deploy.sh` | Full CDK deployment |
| `./scripts/deploy-manual.sh` | Manual AWS CLI deployment |

### Key Concepts

**EAN Resolution Flow:**
1. **Extracted**: Found in invoice (NFe XML cEAN field)
2. **Mapping**: Resolved via saved supplier mapping
3. **Database**: Found in product catalog
4. **Manual**: User-entered via search modal

**Workflow States:**
- `pending_approval`: Awaiting human review
- `approved`: Ready for execution
- `running`: Tasks executing
- `completed`: All tasks done
- `failed`: Task failed (can retry)

### Adding Features

See [CLAUDE.md](./CLAUDE.md) for detailed development guide and agent instructions.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API Gateway URL | Set during deploy |
| `AWS_REGION` | AWS region | us-east-1 |
| `BEDROCK_REGION` | Bedrock region | us-east-1 |

## License

MIT
