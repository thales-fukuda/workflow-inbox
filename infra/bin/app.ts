#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GlobGlobStack } from '../lib/globglob-stack';
import { GitHubOidcStack } from '../lib/github-oidc-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// GitHub OIDC Stack (deploy this first, one-time setup)
// Usage: cdk deploy GlobGlobOidc
new GitHubOidcStack(app, 'GlobGlobOidc', {
  env,
  repositoryOwner: 'thales-fukuda',
  repositoryName: 'workflow-inbox',
});

// Main application stack
// Usage: cdk deploy GlobGlobStack
new GlobGlobStack(app, 'GlobGlobStack', {
  env,
});
