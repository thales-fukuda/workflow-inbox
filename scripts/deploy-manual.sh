#!/bin/bash
set -e

# Manual deployment script (without CDK) for existing infrastructure
# Use this if CDK deployment fails or you need to update existing resources

REGION="${AWS_REGION:-us-east-1}"
LAMBDA_NAME="${LAMBDA_NAME:-workflow-invoice-extractor}"
S3_BUCKET="${S3_BUCKET:-}"

echo "Manual deployment to AWS..."

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
  echo "Error: AWS credentials not configured."
  exit 1
fi

# Build frontend
echo "Step 1: Building frontend..."
npm run build

# Find S3 bucket if not specified
if [ -z "$S3_BUCKET" ]; then
  S3_BUCKET=$(aws s3 ls | grep workflow-inbox | awk '{print $3}' | head -1)
  if [ -z "$S3_BUCKET" ]; then
    echo "Error: No S3 bucket found. Set S3_BUCKET environment variable."
    exit 1
  fi
fi

echo "Step 2: Deploying frontend to s3://$S3_BUCKET..."
aws s3 sync dist/ "s3://$S3_BUCKET" --delete

# Deploy Lambda
echo "Step 3: Deploying Lambda function..."
cd lambda
zip -r ../lambda.zip .
cd ..
aws lambda update-function-code \
  --function-name "$LAMBDA_NAME" \
  --zip-file fileb://lambda.zip \
  --region "$REGION"
rm lambda.zip

echo ""
echo "Deployment complete!"
echo "Website: http://$S3_BUCKET.s3-website-$REGION.amazonaws.com"
