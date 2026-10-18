# 🛡️ AEGIS AI — Autonomous Enterprise Guard & Intelligence System
> **Amazon Developers Hackathon · Defensive Cybersecurity Operations Platform**

AEGIS AI is a defensive security operations center (SOC) demo. It ingests sample cloud telemetry, correlates patterns with MITRE ATT&CK, calculates explainable risk scores, and simulates analyst-reviewed response playbooks.

---

## 🌟 Executive Pitch & Mission

Modern enterprise cloud environments produce millions of fragmented logs across AWS CloudTrail, VPC Flow Logs, Okta identity sessions, and Kubernetes clusters. When breaches occur, defenders face alert fatigue, ambiguous alerts, and high-risk manual containment steps.

**AEGIS AI bridges this gap with:**
1. **Explainable Multi-Factor Risk Scoring**: Deterministic, reproducible scoring based on mathematical formulas, not black-box guesses.
2. **Grounded AI Contextual Analysis**: Powered by **Google Gemini 3.8 Flash** with strict separation between observed hard evidence and probabilistic AI inferences.
3. **Deterministic Fallback**: The demo analyzes sample logs without a Gemini API key using local correlation and heuristic engines.
4. **Dry-Run Response Playbooks**: Playbooks simulate actions. This project has no AWS execution integration and cannot make cloud changes.
5. **Prompt Injection & Secret Defense**: Untrusted machine logs are isolated in strict semantic boundary fences, with automatic redaction of AWS access keys, passwords, and JWT tokens.

---

## 🏗️ System Architecture

```
[ Telemetry Ingestion ]
  ├── AWS CloudTrail JSON
  ├── Okta / Auth0 JSON
  ├── Kubernetes Audit Logs
  └── CSV / Syslog Logs
          │
          ▼
[ Normalizer & Sanitizer ] ──► [ Secret Redactor & Prompt Guard ]
          │                          ├── AKIA / Secret Keys Masked
          │                          └── Untrusted Data Fenced
          ▼
[ Rule Correlator & MITRE Mapper ] ──► [ Sigma / Detection Rules ]
          │                                ├── T1078 (Impossible Travel)
          │                                ├── T1098 (Privilege Escalation)
          │                                ├── T1110 (Brute Force)
          │                                └── T1530 (S3 Exfiltration)
          ▼
[ Explainable Risk Engine ] ──► (Sev × 0.35) + (Vel × 0.20) + (Asset × 0.25) + (Priv × 0.20)
          │
          ├──► [ Gemini 3.8 Flash SDK (Server) ] ──┐
          │                                       ├──► [ Unified Threat Intelligence ]
          └──► [ Deterministic Fallback Engine ] ──┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
[ Incident Lifecycle Management ]   [ Safe Response Playbooks ]
  ├── OPEN / CONTAINING / RESOLVED    ├── Dry-Run Simulation Mode
  ├── Analyst Notes (In-Memory)       ├── Dry-Run Simulation Only
  └── Side-by-Side Comparison         └── Live Execution Unavailable
```

### Technical Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend**: Node.js v22, Express 4, TypeScript via `tsx`.
- **AI Engine**: `@google/genai` TypeScript SDK invoking `gemini-3.8-flash` with system instructions, structured JSON response schemas, and strict prompt fencing.
- **Testing**: Built-in test suite for parser safety, secret redaction, risk calculation, and playbook execution guards.
- **Storage and access**: Demo state is held in server memory and resets on restart. There is no authentication or durable database; do not expose it as a production service.

---

## ⚡ Quick Start & Run Commands

### Prerequisites
- Node.js 20+ or 22+
- npm 10+

### 1. Installation
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Note: A Gemini API key is optional! AEGIS AI automatically activates its deterministic heuristic engine if no key is supplied).*

### 3. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 4. Run Automated Verification Tests
```bash
npm run test
```
Runs the unit suite for parsing, sanitization, risk calculation, fallback analysis, and the playbook execution guard.

### 5. Build for Production
```bash
npm run build
npm start
```

`npm start` serves the built frontend and API on port 3000. Set `PORT` to use a different port.

---

## 🧪 Automated Test Verification

Run `npm run test` to verify all 31 critical platform capabilities:

```text
==================================================
🛡️  AEGIS AI AUTOMATED VERIFICATION SUITE
==================================================

[1/6] Testing Normalizer & Ingestion Engine...
  ✓ PASS: CloudTrail parses exact 4 event records
  ✓ PASS: Detects CloudTrail JSON format correctly
  ✓ PASS: Normalizes IAM actor correctly
  ✓ PASS: Normalizes source IP correctly
  ✓ PASS: CSV parses 2 row events
  ✓ PASS: Identifies CSV format properly
  ✓ PASS: Safely rejects oversized payloads (> 5MB)

[2/6] Testing Secret Redaction & Prompt Safety...
  ✓ PASS: Redacts AWS Access Key IDs
  ✓ PASS: Replaces with safe placeholder
  ✓ PASS: Redacts JWT bearer tokens
  ✓ PASS: Redacts inline password strings
  ✓ PASS: Flags prompt injection adversarial directives
  ✓ PASS: Allows valid defensive security inquiries

[3/6] Testing Rule Detection Engine...
  ✓ PASS: Matches detection rules (found 4)
  ✓ PASS: Accurately maps T1098 (Privilege Escalation / Policy Grant)
  ✓ PASS: Accurately maps T1530 (Data from Cloud Storage Object)
  ✓ PASS: Detects T1059.004 (Unix Shell Interactive Spawn / RCE)

[4/6] Testing Explainable Risk Calculation...
  ✓ PASS: Scores severe multi-stage incident as CRITICAL (score: 94)
  ✓ PASS: Classifies severity category as CRITICAL
  ✓ PASS: Provides transparent breakdown across all 4 risk factors
  ✓ PASS: Emits transparent calculation formula mathematical string
  ✓ PASS: Correctly scores routine CI/CD telemetry as LOW risk (score: 32)

[5/6] Testing Deterministic AI Fallback Engine...
  ✓ PASS: Sets provider flag to deterministic-engine
  ✓ PASS: Generates explicit technical evidence list
  ✓ PASS: Separates probabilistic AI inferences from facts
  ✓ PASS: Includes false positive analysis
  ✓ PASS: Includes ordered remediation action checklist
  ✓ PASS: Calculates bounded confidence rating

[6/6] Testing Playbook Execution Guard...
  ✓ PASS: Allows dry-run simulation without approval
  ✓ PASS: Blocks live execution when no cloud integration is configured
  ✓ PASS: Approval cannot claim live success without a cloud integration

==================================================
TEST SUMMARY: 31 PASSED, 0 FAILED.
==================================================
```

---

## 📋 End-to-End Verification Matrix

| Module | User Action | Expected Behavior | Verification | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Command Center** | Open dashboard | Loads demo metrics and incident queue | Not browser-tested | Not run |
| **Ingestion Engine** | Paste CloudTrail logs | Normalizes actor, IPs, and actions into structured events | Tested with 4 scenarios | **PASS** |
| **Payload Safety** | Upload > 5MB file | Safely rejects with descriptive payload limit error | Automated unit test | **PASS** |
| **Secret Redactor** | Ingest logs with AKIA/JWT | Redacts secret values to `[REDACTED]` placeholders | Automated unit tests | **PASS** |
| **Prompt Guard** | Submit prompt injection attempt | Neutralizes jailbreak directives and fences untrusted data | Tested adversarial attacks | **PASS** |
| **AI Contextual Analysis**| Click "Run AI Defensive Analysis" | Requests Gemini with a configured key, otherwise uses local fallback | Live Gemini request not run in this review | Not run here |
| **Offline Fallback** | Run without API key | Runs local deterministic heuristics | Automated fallback tests | **PASS** |
| **Incident Workflow** | Transition `OPEN` → `CONTAINING` | Updates in-memory status and audit entry | Demo behavior; resets on restart | Demo only |
| **Analyst Notes** | Add investigation note | Adds a note to the in-memory case | Demo behavior; resets on restart | Demo only |
| **Incident Compare** | Select 2 cases to compare | Side-by-side view highlighting common IPs & vectors | Not browser-tested | Not run |
| **Risk Sandbox** | Adjust factor sliders | Recalculates risk factors | Not browser-tested | Not run |
| **False-Positive Tuning**| Add allowlist exception | Adjusts local demo exception list | Not browser-tested | Not run |
| **Safe Playbooks** | Run Dry-Run Simulation | Simulates steps without executing cloud commands | Automated test and API smoke check | **PASS** |
| **Live Playbooks** | Request live action | Returns `501 LIVE_EXECUTION_NOT_CONFIGURED`; no cloud changes are attempted | Automated guard test and API smoke check | **BLOCKED BY DESIGN** |
| **Security Copilot** | Ask defensive question | Uses current demo context where available | Fallback unit behavior tested; UI and Gemini not tested | Partial |
| **Audit Log** | Click Export CSV | Downloads a CSV of in-memory demo audit data | Not browser-tested | Not run |
| **Guided Tour** | Click Guided Tour / press `?` | Opens an onboarding modal | Not browser-tested | Not run |

---

## 🎬 2-Minute Hackathon Demonstration Script

### Act 1: The Command Center (0:00 - 0:30)
1. **Show the Dashboard**: Highlight the dark SOC aesthetic, live posture score (82/100), and the clear **"SYNTHETIC DEMO TELEMETRY"** tag indicating transparent testing data.
2. **Press `⌘K`**: Demonstrate the global command palette to search incidents, assets, and trigger quick actions.

### Act 2: Triage an S3 Exfiltration Attack (0:30 - 1:10)
1. Navigate to **AI Threat Analyzer**.
2. Click **Scenario 1: "AWS CloudTrail: Leaked IAM Key & S3 Exfiltration"**.
3. Point out that the raw logs contain AWS access keys and sensitive bucket operations.
4. Click **"Run AI Defensive Analysis"**.
5. Inspect the structured response:
   - **Observed Hard Evidence vs AI Inferences**: Note that facts extracted from logs are clearly segregated from probabilistic deductions.
   - **Explainable Risk Score**: Point out the mathematical breakdown (94/100 [CRITICAL]).
   - **MITRE ATT&CK Mapping**: Shows `T1098` (Privilege Escalation) and `T1530` (Data from Cloud Storage Object).
6. Click **"Escalate to Incident"** to transition the triage into an active investigation.

### Act 3: Human-in-the-Loop Safe Containment (1:10 - 1:45)
1. Navigate to **Safe Response Playbooks**.
2. Select **"PB-IAM-01: Emergency IAM Credential Revocation"**.
3. Note that live action is marked unavailable because this project has no AWS execution integration.
4. Run the dry-run simulation and point out that no cloud changes are made.

### Act 4: AI Security Copilot & CISO Briefing (1:45 - 2:00)
1. Navigate to **AI Security Copilot**.
2. Click the quick suggested query: *"What AWS CLI commands should I run immediately to contain this?"*.
3. Observe how the copilot cites specific event IDs (`#EV-XXXX`), redacts secrets, and provides step-by-step containment procedures.
4. Open **Executive Report** to preview the printable, board-level posture summary.

---

## ☁️ Future AWS integration considerations

The following IAM policy is a starting point for a future integration only. This project does not use AWS credentials or execute the listed actions. Review and narrow the policy before any real deployment.

AEGIS AI is designed to integrate into AWS environments following least-privilege principles:

### Recommended AWS Services
- **Hosting**: AWS App Runner (containerized) or Amazon ECS Fargate.
- **Log Ingestion**: Amazon Kinesis Data Firehose streaming CloudTrail and VPC Flow Logs into AEGIS.
- **Secret Management**: AWS Secrets Manager for Gemini API credentials.
- **Network Perimeter**: AWS WAF with IPSet rules managed by AEGIS Playbook `PB-NET-02`.

### Least-Privilege IAM Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AegisCloudTrailReadOnly",
      "Effect": "Allow",
      "Action": [
        "cloudtrail:LookupEvents",
        "cloudtrail:GetEventSelectors"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AegisDefensiveContainment",
      "Effect": "Allow",
      "Action": [
        "iam:UpdateAccessKey",
        "iam:PutUserPolicy",
        "iam:DetachUserPolicy",
        "wafv2:UpdateIPSet",
        "s3:PutPublicAccessBlock",
        "s3:DeleteBucketPolicy",
        "ec2:CreateSnapshot",
        "ec2:ModifyInstanceAttribute"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": ["us-east-1", "us-west-2"]
        }
      }
    }
  ]
}
```

---

## ⚖️ Limitations & Truthful Disclosures

In accordance with hackathon integrity guidelines:
1. **Synthetic Telemetry**: The built-in scenarios use realistic synthetic telemetry derived from public MITRE ATT&CK attack emulations. AEGIS AI never presents simulated events as real attacks.
2. **Containment Integrations**: Playbooks are simulations only. There is no AWS execution adapter; analyst approval does not enable real cloud changes.
3. **Storage and access control**: API state is in memory, with no authentication or database. Keep the demo on a trusted local machine.
4. **Probabilistic AI**: Generative AI is advisory. Review its output before acting on recommendations.

---

## 🏆 Hackathon Submission Checklist

- [x] Runnable full-stack demo (React 19 + Express + TypeScript)
- [x] Gemini integration is available when a key is configured; live Gemini was not verified in this review
- [x] Deterministic fallback for local demonstration
- [x] Automated checks are available through `npm test`, `npm run lint`, and `npm run build`
- [ ] Production hardening, durable storage, authentication, and cloud execution integration
- [x] Transparent explainable risk scoring mathematical model
- [x] Server guard rejects live playbooks until a real cloud integration exists
- [x] Secret redactor and prompt injection defense guardrails
- [x] Multi-format log parser supporting CloudTrail, CSV, JSON, and Syslog
- [x] CISO executive posture report with markdown and printable layouts
- [x] 2-minute live demo script and guided tour modal

---
*Built with ❤️ for the Amazon Developers Hackathon · AEGIS AI SOC v2.4*

See [SUBMISSION.md](SUBMISSION.md) for exact local run, verification, and GitHub push instructions.
