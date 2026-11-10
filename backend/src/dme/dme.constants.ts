export const DME_DEFAULT_RULES = [
  {
    code: 'DME-DOCKER-001',
    category: 'docker',
    name: 'Privileged & Root Container Detection',
    severity: 'high',
    description: 'Checks whether containers run with privileged flags, root user, or dangerous capabilities.',
    remediation: "Specify a non-root USER directive in Dockerfile and remove '--privileged' flag."
  },
  {
    code: 'DME-DOCKER-002',
    category: 'docker',
    name: 'Container Crash & Restart Loop Detection',
    severity: 'critical',
    description: 'Identifies containers frequently restarting or failing healthchecks.',
    remediation: 'Inspect container stdout/stderr logs and adjust entrypoint healthchecks.'
  },
  {
    code: 'DME-DOCKER-003',
    category: 'docker',
    name: 'Resource Limit Constraints Check',
    severity: 'medium',
    description: 'Verifies that running containers enforce memory and CPU limits to prevent noisy neighbor starvation.',
    remediation: "Add 'mem_limit' / 'cpus' in docker-compose.yml or deploy specs."
  },
  {
    code: 'DME-K8S-001',
    category: 'kubernetes',
    name: 'Pod CrashLoopBackOff & Error Phase Check',
    severity: 'critical',
    description: 'Detects Kubernetes pods trapped in CrashLoopBackOff, ImagePullBackOff, or Error states.',
    remediation: "Inspect pod events using 'kubectl describe pod' and verify container startup commands."
  },
  {
    code: 'DME-K8S-002',
    category: 'kubernetes',
    name: 'Cluster Warning Event Spike Analysis',
    severity: 'high',
    description: 'Analyzes cluster event logs for recurring Warning events (e.g. FailedScheduling, BackOff, Evicted).',
    remediation: 'Review cluster events for node pressure, scheduling bottlenecks, or volume mount errors.'
  },
  {
    code: 'DME-K8S-003',
    category: 'kubernetes',
    name: 'Deployment Replica Availability Audit',
    severity: 'high',
    description: 'Ensures targeted deployments have 100% of desired replicas active and ready.',
    remediation: 'Verify cluster compute capacity and check pod scheduling constraints.'
  },
  {
    code: 'DME-GIT-001',
    category: 'git',
    name: 'Secret Pattern & Sensitive Commit Scan',
    severity: 'critical',
    description: 'Inspects commit logs and working copy for leaked credentials, private keys, or API tokens.',
    remediation: 'Ensure sensitive secrets are in .gitignore and revoked immediately if pushed.'
  },
  {
    code: 'DME-GIT-002',
    category: 'git',
    name: 'Branch Hygiene & Remote Divergence',
    severity: 'medium',
    description: 'Flags detached HEAD states or excessive unpushed/unmerged commits on release branches.',
    remediation: 'Checkout a named feature or main branch to prevent orphan commits.'
  },
  {
    code: 'DME-TF-001',
    category: 'terraform',
    name: 'Destructive Plan & Drift Risk Check',
    severity: 'high',
    description: 'Validates Terraform execution plans to guard against unexpected resource destruction or missing locks.',
    remediation: 'Confirm resource lifecycle prevent_destroy settings before applying plan.'
  },
  {
    code: 'DME-TF-002',
    category: 'terraform',
    name: 'State Integrity & Locking Verification',
    severity: 'medium',
    description: 'Verifies that Terraform configurations enforce backend state locking to prevent concurrent mutation.',
    remediation: "Configure 'dynamodb_table' attribute in terraform backend config."
  },
  {
    code: 'DME-JENKINS-001',
    category: 'jenkins',
    name: 'Pipeline Failure & Health Trend Monitor',
    severity: 'high',
    description: 'Monitors Jenkins jobs for failing builds (red balls), missing builds, or unstable tests.',
    remediation: 'Inspect console log output of failing builds and fix underlying compilation or test failures.'
  },
  {
    code: 'DME-JENKINS-002',
    category: 'jenkins',
    name: 'Queue Starvation & Blocked Build Check',
    severity: 'medium',
    description: 'Detects builds stalled in queue waiting on offline executors or unsatisfied labels.',
    remediation: 'Check label assignments on executor nodes and ensure adequate executor capacity.'
  },
  {
    code: 'DME-JENKINS-003',
    category: 'jenkins',
    name: 'Executor Node Offline & Capacity Check',
    severity: 'high',
    description: 'Flags Jenkins agent nodes marked offline or reporting low disk/temporary space.',
    remediation: 'Bring agent nodes online or reconnect SSH/JNLP launcher daemons.'
  },
  {
    code: 'DME-CORR-001',
    category: 'correlation',
    name: 'CI-to-Deployment Release Sync Verification',
    severity: 'medium',
    description: 'Correlates Jenkins successful build artifacts with active Kubernetes deployment container images.',
    remediation: 'Re-trigger deployment pipeline or verify image registry push credentials.'
  },
  {
    code: 'DME-CORR-002',
    category: 'correlation',
    name: 'Cross-System Incident Cascade Correlation',
    severity: 'critical',
    description: 'Detects if a cluster or container outage immediately succeeded a recent code commit or Terraform apply.',
    remediation: 'Consider rollback of recent Terraform run or git release tag.'
  }
];
