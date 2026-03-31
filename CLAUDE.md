# GlobGlob - AI-Powered Invoice Processing Platform

## Project Overview

GlobGlob is an AI-powered task orchestration platform for e-commerce operations. It receives invoices (PDF, XML, images), uses AI to extract data, and creates automated workflows with human-in-the-loop approval.

**Key Features:**
- Invoice data extraction using AWS Bedrock (Claude Haiku)
- EAN/GTIN barcode resolution for product identification
- Editable review before workflow approval
- Product catalog with supplier mapping persistence
- Multi-language support (English, Portuguese-BR)

## Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS with custom animations
- Zustand for state management (with localStorage persistence)
- Vitest for testing

**Backend:**
- AWS Lambda (Node.js 20.x) for invoice extraction
- AWS Bedrock with Claude Haiku model (`us.anthropic.claude-haiku-4-5-20251001-v1:0`)
- AWS API Gateway for REST API
- AWS S3 for static website hosting

**Infrastructure:**
- AWS CDK v2 for infrastructure as code
- Located in `infra/` directory

## Project Structure

```
globglob/
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── Inbox.tsx       # Workflow list view
│   │   ├── WorkflowDetail.tsx  # Editable workflow detail
│   │   ├── WorkflowCard.tsx    # Workflow list item
│   │   ├── ProductCatalog.tsx  # Product/mapping catalog
│   │   ├── EanSearchModal.tsx  # EAN lookup modal
│   │   └── UploadModal.tsx     # Invoice upload
│   ├── store/              # Zustand stores
│   │   ├── workflowStore.ts    # Workflow state
│   │   └── productStore.ts     # Product catalog (persisted)
│   ├── services/           # External services
│   │   └── eanService.ts       # EAN validation & Open Food Facts API
│   ├── types/              # TypeScript types
│   ├── i18n/               # Internationalization
│   └── utils/              # Utility functions
├── lambda/                 # Lambda function
│   └── index.mjs           # Invoice extraction handler
├── infra/                  # AWS CDK infrastructure
│   ├── lib/globglob-stack.ts   # Main CDK stack
│   └── bin/app.ts              # CDK app entry
├── scripts/                # Build/deploy scripts
│   ├── build.sh
│   ├── test.sh
│   ├── deploy.sh           # CDK deployment
│   └── deploy-manual.sh    # Manual AWS CLI deployment
└── dist/                   # Built frontend (gitignored)
```

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Deployment

### Using CDK (Recommended)
```bash
./scripts/deploy.sh
```

### Manual Deployment
```bash
# Set environment variables
export LAMBDA_NAME=workflow-invoice-extractor
export S3_BUCKET=workflow-inbox-1774912847

./scripts/deploy-manual.sh
```

## Key Types

### LineItem (src/types/index.ts)
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

### EAN Resolution Flow
1. **Extracted**: EAN found directly in invoice (NFe XML: cEAN, cEANTrib fields)
2. **Mapping**: EAN resolved via saved supplier product mapping
3. **Database**: EAN found in product catalog
4. **User**: EAN manually entered by user

## API Endpoints

### POST /extract
Extracts invoice data from uploaded files.

**Request:**
```json
{
  "file": "base64-encoded-file",
  "fileName": "invoice.pdf",
  "mimeType": "application/pdf"
}
```

**Response:**
```json
{
  "supplier": "ACME Corp",
  "invoiceNumber": "INV-001",
  "date": "2026-03-30",
  "total": 1000.00,
  "currency": "BRL",
  "lineItems": [...],
  "hasUnresolvedEans": true,
  "isEdited": false
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | API Gateway URL | (set during deploy) |
| AWS_REGION | AWS region | us-east-1 |
| BEDROCK_REGION | Bedrock region | us-east-1 |

## Common Tasks

### Adding a new translation
1. Edit `src/i18n/translations.ts`
2. Add key to both `en` and `pt-BR` objects
3. Use with `const { t } = useLanguage(); t('yourKey')`

### Adding a new component
1. Create in `src/components/`
2. Use existing patterns for styling (Tailwind)
3. Import types from `src/types/index.ts`

### Modifying Lambda
1. Edit `lambda/index.mjs`
2. Test locally or deploy with `./scripts/deploy-manual.sh`

### Adding CDK resources
1. Edit `infra/lib/globglob-stack.ts`
2. Run `cd infra && npx cdk diff` to preview changes
3. Deploy with `./scripts/deploy.sh`

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/store/workflowStore.test.ts
```

## Troubleshooting

### Bedrock Model Access Denied
- Ensure Lambda role has `bedrock:InvokeModel` permission
- Model must be enabled in AWS Bedrock console
- Use inference profile: `us.anthropic.claude-haiku-4-5-20251001-v1:0`

### White Screen on Load
- Check browser console for errors
- Ensure TypeScript `import type` for type-only imports
- Run `npm run build` to check for compile errors

### S3 Website Not Updating
- Clear CloudFront cache if using CDN
- Check S3 bucket policy allows public read
- Verify `index.html` exists in bucket root
