import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface GitHubOidcStackProps extends cdk.StackProps {
  repositoryOwner: string;
  repositoryName: string;
}

export class GitHubOidcStack extends cdk.Stack {
  public readonly deployRoleArn: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: GitHubOidcStackProps) {
    super(scope, id, props);

    const { repositoryOwner, repositoryName } = props;

    // Create the GitHub OIDC Provider (or import if exists)
    const githubProvider = new iam.OpenIdConnectProvider(this, 'GitHubOidcProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
      thumbprints: ['ffffffffffffffffffffffffffffffffffffffff'], // GitHub's thumbprint
    });

    // IAM Role for GitHub Actions
    const deployRole = new iam.Role(this, 'GitHubActionsDeployRole', {
      roleName: 'GlobGlob-GitHubActions-DeployRole',
      assumedBy: new iam.WebIdentityPrincipal(
        githubProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': `repo:${repositoryOwner}/${repositoryName}:*`,
          },
        }
      ),
      description: 'Role assumed by GitHub Actions to deploy GlobGlob',
      maxSessionDuration: cdk.Duration.hours(1),
    });

    // CDK deployment permissions
    deployRole.addToPolicy(new iam.PolicyStatement({
      sid: 'CDKDeployPermissions',
      effect: iam.Effect.ALLOW,
      actions: [
        // CloudFormation
        'cloudformation:*',
        // S3 (for CDK assets and website)
        's3:*',
        // Lambda
        'lambda:*',
        // API Gateway
        'apigateway:*',
        // IAM (for creating roles)
        'iam:*',
        // SSM (CDK bootstrap)
        'ssm:GetParameter',
        'ssm:PutParameter',
        // ECR (CDK assets)
        'ecr:*',
        // STS
        'sts:AssumeRole',
      ],
      resources: ['*'],
    }));

    // CDK bootstrap role assumption
    deployRole.addToPolicy(new iam.PolicyStatement({
      sid: 'CDKBootstrapRoles',
      effect: iam.Effect.ALLOW,
      actions: ['sts:AssumeRole'],
      resources: [
        `arn:aws:iam::${this.account}:role/cdk-*`,
      ],
    }));

    // Output the role ARN
    this.deployRoleArn = new cdk.CfnOutput(this, 'DeployRoleArn', {
      value: deployRole.roleArn,
      description: 'ARN of the GitHub Actions deploy role. Add this to GitHub Secrets as AWS_DEPLOY_ROLE_ARN',
      exportName: 'GlobGlobGitHubActionsRoleArn',
    });
  }
}
