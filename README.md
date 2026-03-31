# GlobGlob

AI-powered invoice processing and task orchestration platform for e-commerce.

**Live Demo**: http://workflow-inbox-1774912847.s3-website-us-east-1.amazonaws.com

## Features

- **AI Invoice Extraction** - Upload PDF, XML (NFe), or images; AI extracts structured data
- **EAN/GTIN Resolution** - Link products to universal barcodes via multiple sources
- **Editable Review** - Edit extracted data before approval
- **Product Catalog** - Persistent product database with supplier mappings
- **Workflow Automation** - Automated task execution with human-in-the-loop
- **Multi-language** - English and Portuguese (Brazil)

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm test             # Run tests
npm run build        # Build for production
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| Backend | AWS Lambda (Node.js 20.x), API Gateway |
| AI | AWS Bedrock (Claude Haiku 4.5) |
| Infrastructure | AWS CDK v2, S3, IAM |
| CI/CD | GitHub Actions with OIDC |

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  S3 Static  │     │ API Gateway │────▶│   Lambda    │
│             │     │   Website   │     │             │     │ (Extractor) │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │ AWS Bedrock │
                                                            │(Claude Haiku)│
                                                            └─────────────┘
```

## Project Structure

```
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── store/           # Zustand state stores
│   ├── services/        # API integrations
│   ├── types/           # TypeScript types
│   └── i18n/            # Translations
├── lambda/              # AWS Lambda functions
├── infra/               # AWS CDK infrastructure
├── scripts/             # Build & deploy scripts
├── .github/workflows/   # CI/CD pipeline
└── CLAUDE.md            # Development guide
```

## Deployment

### Automatic (CI/CD)

Every push to `main` automatically deploys via GitHub Actions.

**One-time setup:**
```bash
./scripts/setup-github-oidc.sh
# Add output role ARN to GitHub Secrets as AWS_DEPLOY_ROLE_ARN
```

### Manual

```bash
./scripts/deploy.sh              # Full CDK deployment
./scripts/deploy-manual.sh       # AWS CLI deployment
```

## Development

See **[CLAUDE.md](./CLAUDE.md)** for:
- Code change workflow
- Commit conventions
- Coding standards
- Common tasks
- Troubleshooting

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run tests |
| `npm run lint` | Lint code |
| `./scripts/deploy.sh` | Deploy via CDK |

## License

MIT
