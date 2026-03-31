#!/bin/bash
set -e

REGION="${AWS_REGION:-us-east-1}"

echo "Deploying GlobGlob to AWS..."

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
  echo "Error: AWS credentials not configured. Run 'aws configure' first."
  exit 1
fi

# Build frontend first
echo "Step 1: Building frontend..."
npm run build

# Deploy using CDK
echo "Step 2: Deploying infrastructure with CDK..."
cd infra
npm install
npx cdk deploy --require-approval never --outputs-file ../cdk-outputs.json
cd ..

# Extract outputs
if [ -f "cdk-outputs.json" ]; then
  echo ""
  echo "Deployment complete!"
  echo "===================="
  cat cdk-outputs.json | jq -r '.GlobGlobStack | to_entries[] | "\(.key): \(.value)"'
fi
