#!/bin/bash
set -e

echo "Setting up GitHub OIDC for automated deployments..."
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
  echo "Error: AWS credentials not configured. Run 'aws configure' first."
  exit 1
fi

# Check if CDK is bootstrapped
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="${AWS_REGION:-us-east-1}"

echo "Account: $ACCOUNT_ID"
echo "Region: $REGION"
echo ""

# Bootstrap CDK if needed
echo "Step 1: Checking CDK bootstrap..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region "$REGION" &> /dev/null; then
  echo "CDK not bootstrapped. Bootstrapping now..."
  cd infra
  npm ci
  npx cdk bootstrap "aws://$ACCOUNT_ID/$REGION"
  cd ..
else
  echo "CDK already bootstrapped."
fi

# Deploy OIDC stack
echo ""
echo "Step 2: Deploying GitHub OIDC stack..."
cd infra
npm ci
npx cdk deploy GlobGlobOidc --require-approval never --outputs-file ../oidc-outputs.json
cd ..

# Extract role ARN
ROLE_ARN=$(cat oidc-outputs.json | grep -o '"DeployRoleArn": "[^"]*"' | cut -d'"' -f4)

echo ""
echo "=============================================="
echo "GitHub OIDC Setup Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Go to your GitHub repository settings:"
echo "   https://github.com/thales-fukuda/workflow-inbox/settings/secrets/actions"
echo ""
echo "2. Add a new repository secret:"
echo "   Name:  AWS_DEPLOY_ROLE_ARN"
echo "   Value: $ROLE_ARN"
echo ""
echo "3. Push to main branch to trigger automatic deployment!"
echo ""
echo "=============================================="
