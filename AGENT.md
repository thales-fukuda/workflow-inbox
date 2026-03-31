# AI Agent Architecture

This document describes the AI agent system powering Workflow Inbox.

## Current Implementation

### Invoice Extraction Agent

The MVP includes a single agent for invoice data extraction.

**Location:** `lambda/index.mjs`

**Model:** Claude 3.5 Haiku (`us.anthropic.claude-3-5-haiku-20241022-v1:0`)

**Capabilities:**
- Parse PDF invoices (visual analysis)
- Parse XML invoices (NFe/NFSe Brazilian electronic invoices)
- Parse image invoices (JPG, PNG, WebP)
- Extract structured data: supplier, invoice number, date, total, line items
- Identify missing SKUs (mark as `isNewSku: true`)

**System Prompt:**
```
You are an invoice data extraction agent. Your job is to analyze invoice
images or documents and extract structured data.

You MUST respond with ONLY a valid JSON object with this structure:
{
  "supplier": "Company name",
  "invoiceNumber": "Invoice ID",
  "date": "YYYY-MM-DD",
  "total": 0.00,
  "currency": "BRL or USD",
  "lineItems": [
    {
      "name": "Product name",
      "sku": "SKU or null",
      "quantity": 1,
      "unitPrice": 0.00,
      "isNewSku": false
    }
  ]
}
```

## Skill Library

### Current Skills (Mock)

| Skill ID | Name | Description |
|----------|------|-------------|
| `parse_invoice` | Parse Invoice | Extract data from invoice (AI-powered) |
| `create_sku` | Create SKU | Register new product in catalog |
| `register_invoice` | Register Invoice | Record invoice in financial system |
| `update_inventory` | Update Inventory | Adjust stock quantities |

### Skill Interface

```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number; // milliseconds

  // Future: actual execution
  execute?: (params: SkillParams) => Promise<SkillResult>;

  // Future: validation
  validate?: (params: SkillParams) => ValidationResult;

  // Future: rollback capability
  rollback?: (executionId: string) => Promise<void>;
}
```

## Future: Skill Studio

### Vision

Enable non-developers to create skills through AI-assisted interviews.

### Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Team Member    │────▶│   AI Interview  │────▶│  Skill Draft    │
│  "I want to     │     │  "What system?" │     │  Generated code │
│   automate X"   │     │  "What inputs?" │     │  + config       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Production     │◀────│  Review &       │◀────│  Test & Eval    │
│  Skill Library  │     │  Approval       │     │  Sandbox run    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Interview Agent Prompt (Concept)

```
You are a skill creation assistant. Your job is to interview team members
about business processes they want to automate.

Ask about:
1. What triggers this process?
2. What systems/data are involved?
3. What are the steps?
4. What can go wrong?
5. How do you know it succeeded?

Output a skill specification in JSON format.
```

## Future: Planning Agent

### Vision

Decompose user requests into executable task plans.

### Example

**Input:** "Process the invoice from ACME Corp"

**Output:**
```json
{
  "tasks": [
    {"skill": "parse_invoice", "params": {"source": "email_attachment"}},
    {"skill": "create_sku", "params": {"products": ["new_items"]}, "conditional": true},
    {"skill": "register_invoice", "params": {"system": "erp"}},
    {"skill": "update_inventory", "params": {"operation": "add"}}
  ],
  "dependencies": {
    "1": [],
    "2": ["1"],
    "3": ["1", "2"],
    "4": ["3"]
  }
}
```

## Future: Event Detection Agent

### Vision

Monitor event sources and trigger appropriate workflows.

### Event Sources

| Source | Detection Method |
|--------|------------------|
| Email | IMAP polling / webhook |
| File Drop | S3 event notification |
| Schedule | CloudWatch Events |
| Webhook | API Gateway endpoint |
| Manual | UI trigger |

### Classification Prompt (Concept)

```
You are an event classifier. Given an incoming event, determine:
1. Event type (invoice, order, inquiry, etc.)
2. Priority (urgent, normal, low)
3. Suggested workflow template
4. Extracted key entities

Respond in JSON format.
```

## Evaluation & Improvement

### Metrics to Track

- **Extraction Accuracy**: Compare AI output to human corrections
- **Approval Rate**: % of workflows approved without edits
- **Task Success Rate**: % of skill executions that succeed
- **Time Saved**: Estimated manual time vs automated time

### Feedback Loop

```
┌─────────────────┐
│  AI Extraction  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Human Review   │────▶│  Corrections    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Approve/Edit   │     │  Fine-tuning    │
└─────────────────┘     │  Dataset        │
                        └─────────────────┘
```

## Security Considerations

### Current

- Lambda runs in isolated environment
- API Gateway with CORS restrictions
- No user data persistence (stateless)

### Future

- Skill execution sandboxing
- Credential management (AWS Secrets Manager)
- Audit logging for all skill executions
- Role-based access control for skill creation

## Cost Optimization

### Current Costs (Estimated)

| Service | Cost Factor |
|---------|-------------|
| Bedrock (Haiku) | ~$0.001 per invoice |
| Lambda | ~$0.0001 per invocation |
| API Gateway | ~$0.000001 per request |
| S3 | ~$0.02/month for hosting |

### Optimization Strategies

1. **Caching**: Cache extraction results for duplicate invoices
2. **Batching**: Process multiple invoices in single API call
3. **Model Selection**: Use cheaper models for simple extractions
4. **Edge Cases**: Fall back to human review instead of retrying AI
