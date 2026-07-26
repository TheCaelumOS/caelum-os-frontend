import { BaseAppPlugin } from './base.plugin';

export class DockerPlugin extends BaseAppPlugin {
  constructor() {
    super({
      id: 'docker',
      name: 'Docker Hub',
      icon: 'docker',
      category: 'DevOps',
      launchCommand: 'docker-desktop',
      website: 'https://hub.docker.com',
      description: 'Manage containers, images, volumes, and networks.',
    }, true, false);
  }
}

export class GitPlugin extends BaseAppPlugin {
  constructor() {
    super({
      id: 'git',
      name: 'Git Integration',
      icon: 'git',
      category: 'DevOps',
      launchCommand: 'git status',
      website: 'https://git-scm.com',
      description: 'Git repository sync controls, logs, commits, branches, and push/pull integrations.',
    }, true, false);
  }
}

export class TerraformPlugin extends BaseAppPlugin {
  constructor() {
    super({
      id: 'terraform',
      name: 'Terraform Provisioner',
      icon: 'terraform',
      category: 'DevOps',
      launchCommand: 'terraform version',
      website: 'https://terraform.io',
      description: 'Define and provision infrastructure as code using Terraform.',
    }, true, false);
  }
}

export class AwsPlugin extends BaseAppPlugin {
  constructor() {
    super({
      id: 'aws',
      name: 'AWS Cloud',
      icon: 'aws',
      category: 'Cloud',
      launchCommand: 'aws configure',
      website: 'https://aws.amazon.com',
      description: 'Connect, monitor, and configure Amazon Web Services console operations.',
    }, true, false);
  }
}

export class AzurePlugin extends BaseAppPlugin {
  constructor() {
    super({
      id: 'azure',
      name: 'Azure Cloud',
      icon: 'azure',
      category: 'Cloud',
      launchCommand: 'az login',
      website: 'https://portal.azure.com',
      description: 'Connect, monitor, and configure Microsoft Azure cloud service dashboards.',
    }, true, false);
  }
}

export class KubernetesPlugin extends BaseAppPlugin {
  constructor() {
    super({
      id: 'kubernetes',
      name: 'Kubernetes Engine',
      icon: 'kubernetes',
      category: 'DevOps',
      launchCommand: 'kubectl get all',
      website: 'https://kubernetes.io',
      description: 'Manage and orchestrate clusters, namespaces, pods, and service deployments.',
    }, true, false);
  }
}

export class VscodePlugin extends BaseAppPlugin {
  constructor() {
    super({
      id: 'vscode',
      name: 'VS Code Editor',
      icon: 'vscode',
      category: 'System',
      launchCommand: 'code .',
      website: 'https://code.visualstudio.com',
      description: 'Launch VS Code inside workspace directories.',
    }, true, false);
  }
}

export class TerminalPlugin extends BaseAppPlugin {
  constructor() {
    super({
      id: 'terminal',
      name: 'AI Terminal',
      icon: 'terminal',
      category: 'System',
      launchCommand: 'bash',
      website: '',
      description: 'Interactive PTY CLI shell with integrated AI prompts.',
    }, true, true); // Terminal starts active by default
  }
}

export class BrowserPlugin extends BaseAppPlugin {
  constructor() {
    super({
      id: 'browser',
      name: 'Web Browser',
      icon: 'browser',
      category: 'DevOps',
      launchCommand: 'firefox',
      website: 'https://firefox.com',
      description: 'Browse AWS dashboards or CaelumOS system documentation.',
    }, true, false);
  }
}

export class FileManagerPlugin extends BaseAppPlugin {
  constructor() {
    super({
      id: 'nautilus', // matching 'nautilus' file manager ID
      name: 'Files Explorer',
      icon: 'folder',
      category: 'System',
      launchCommand: 'nautilus',
      website: '',
      description: 'Traverse folders, S3 buckets, GitHub repos, and Terraform states.',
    }, true, false);
  }
}

export const appPluginsList = [
  new DockerPlugin(),
  new GitPlugin(),
  new TerraformPlugin(),
  new AwsPlugin(),
  new AzurePlugin(),
  new KubernetesPlugin(),
  new VscodePlugin(),
  new TerminalPlugin(),
  new BrowserPlugin(),
  new FileManagerPlugin(),
];
