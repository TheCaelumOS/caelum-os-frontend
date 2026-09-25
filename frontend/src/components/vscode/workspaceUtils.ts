import { WorkspaceFile } from './types';

export function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'ts':
    case 'tsx':
    case 'mts':
      return 'typescript';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'c':
    case 'h':
      return 'c';
    case 'cpp':
    case 'hpp':
    case 'cc':
    case 'cxx':
      return 'cpp';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
    case 'scss':
    case 'less':
      return 'css';
    case 'json':
    case 'jsonc':
      return 'json';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'sql':
      return 'sql';
    case 'dockerfile':
      return 'dockerfile';
    case 'tf':
    case 'tfvars':
    case 'hcl':
      return 'hcl';
    case 'sh':
    case 'bash':
    case 'zsh':
      return 'shell';
    case 'xml':
    case 'svg':
      return 'xml';
    default:
      if (filePath.toLowerCase().endsWith('dockerfile')) return 'dockerfile';
      return 'plaintext';
  }
}

export function getDefaultWorkspace(): WorkspaceFile[] {
  return [
    {
      id: 'root-readme',
      name: 'README.md',
      path: '/README.md',
      language: 'markdown',
      content: `# CaelumOS Developer Workspace

Welcome to your native CaelumOS code editor!

## Integrated Features
- **Monaco Editor Engine**: Full syntax highlighting, tabbed editing, keyboard shortcuts (Ctrl+S, Ctrl+F, Ctrl+Z).
- **Multi-Language Support**: TypeScript, Python, Dockerfile, Terraform, Go, Java, C++, SQL, YAML.
- **Built-in Shell Terminal**: Execute commands directly via the CaelumOS runtime (\`docker\`, \`kubectl\`, \`git\`, \`npm\`, \`terraform\`).
- **File System Access**: Click "Open Local Folder" to edit files directly on your computer, or explore the sandbox.
- **Git Source Control**: Inspect diffs and manage commits.
`,
    },
    {
      id: 'root-backend',
      name: 'backend',
      path: '/backend',
      isDirectory: true,
      content: '',
      language: '',
      children: [
        {
          id: 'be-main',
          name: 'main.ts',
          path: '/backend/src/main.ts',
          language: 'typescript',
          content: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(\`[CaelumOS Backend] Listening on http://localhost:\${port}\`);
}
bootstrap();
`,
        },
        {
          id: 'be-app-module',
          name: 'app.module.ts',
          path: '/backend/src/app.module.ts',
          language: 'typescript',
          content: `import { Module } from '@nestjs/common';
import { DockerModule } from './integrations/docker/docker.module';
import { KubernetesModule } from './integrations/kubernetes/kubernetes.module';
import { GrafanaModule } from './integrations/grafana/grafana.module';

@Module({
  imports: [DockerModule, KubernetesModule, GrafanaModule],
})
export class AppModule {}
`,
        },
      ],
    },
    {
      id: 'root-frontend',
      name: 'frontend',
      path: '/frontend',
      isDirectory: true,
      content: '',
      language: '',
      children: [
        {
          id: 'fe-app',
          name: 'Desktop.tsx',
          path: '/frontend/src/Desktop.tsx',
          language: 'typescript',
          content: `"use client";

import React, { useState } from 'react';

export default function Desktop() {
  const [activeApp, setActiveApp] = useState('vscode');
  return (
    <div className="h-screen w-screen bg-[#2c001e] text-white">
      <h1>CaelumOS Desktop Environment</h1>
    </div>
  );
}
`,
        },
      ],
    },
    {
      id: 'root-docker',
      name: 'docker',
      path: '/docker',
      isDirectory: true,
      content: '',
      language: '',
      children: [
        {
          id: 'docker-compose',
          name: 'docker-compose.yml',
          path: '/docker/docker-compose.yml',
          language: 'yaml',
          content: `version: '3.8'

services:
  caelum-postgres:
    image: postgres:15-alpine
    container_name: caelum-postgres
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: caelum_user
      POSTGRES_PASSWORD: secure_pass_2026
      POSTGRES_DB: caelum_os_db
    restart: unless-stopped

  caelum-redis:
    image: redis:7-alpine
    container_name: caelum-redis
    ports:
      - '6379:6379'
    restart: unless-stopped
`,
        },
      ],
    },
    {
      id: 'root-k8s',
      name: 'kubernetes',
      path: '/kubernetes',
      isDirectory: true,
      content: '',
      language: '',
      children: [
        {
          id: 'k8s-minikube',
          name: 'minikube-deployment.yaml',
          path: '/kubernetes/minikube-deployment.yaml',
          language: 'yaml',
          content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: caelum-api
  namespace: default
  labels:
    app: caelum-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: caelum-api
  template:
    metadata:
      labels:
        app: caelum-api
    spec:
      containers:
      - name: api
        image: caelum-os/api:latest
        ports:
        - containerPort: 4000
`,
        },
      ],
    },
    {
      id: 'root-terraform',
      name: 'terraform',
      path: '/terraform',
      isDirectory: true,
      content: '',
      language: '',
      children: [
        {
          id: 'tf-main',
          name: 'main.tf',
          path: '/terraform/main.tf',
          language: 'hcl',
          content: `terraform {
  required_version = ">= 1.5.0"
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

resource "local_file" "welcome" {
  filename = "\${path.module}/welcome.txt"
  content  = "CaelumOS Infrastructure as Code provisioned successfully.\\n"
}
`,
        },
      ],
    },
    {
      id: 'root-scripts',
      name: 'scripts',
      path: '/scripts',
      isDirectory: true,
      content: '',
      language: '',
      children: [
        {
          id: 'py-health',
          name: 'health_check.py',
          path: '/scripts/health_check.py',
          language: 'python',
          content: `#!/usr/bin/env python3
import urllib.request
import json
import sys

def check_service(name, url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'CaelumOS-Diagnostic/1.0'})
        with urllib.request.urlopen(req, timeout=3) as res:
            print(f"[{name}] status: {res.status} OK")
            return True
    except Exception as e:
        print(f"[{name}] failed: {e}")
        return False

if __name__ == '__main__':
    backend = check_service("Backend API", "http://localhost:4000/health")
    sys.exit(0 if backend else 1)
`,
        },
      ],
    },
  ];
}

export function findFileInTree(nodes: WorkspaceFile[], fileId: string): WorkspaceFile | null {
  for (const node of nodes) {
    if (node.id === fileId) return node;
    if (node.isDirectory && node.children) {
      const found = findFileInTree(node.children, fileId);
      if (found) return found;
    }
  }
  return null;
}

export function updateFileContentInTree(
  nodes: WorkspaceFile[],
  fileId: string,
  newContent: string,
  isModified = true,
): WorkspaceFile[] {
  return nodes.map((node) => {
    if (node.id === fileId) {
      return { ...node, content: newContent, isModified };
    }
    if (node.isDirectory && node.children) {
      return {
        ...node,
        children: updateFileContentInTree(node.children, fileId, newContent, isModified),
      };
    }
    return node;
  });
}

export function addFileToTree(
  nodes: WorkspaceFile[],
  parentPath: string,
  newFile: WorkspaceFile,
): WorkspaceFile[] {
  if (parentPath === '/' || !parentPath) {
    return [...nodes, newFile];
  }
  return nodes.map((node) => {
    if (node.path === parentPath && node.isDirectory) {
      return {
        ...node,
        children: [...(node.children || []), newFile],
      };
    }
    if (node.isDirectory && node.children) {
      return {
        ...node,
        children: addFileToTree(node.children, parentPath, newFile),
      };
    }
    return node;
  });
}

export function deleteFileFromTree(nodes: WorkspaceFile[], fileId: string): WorkspaceFile[] {
  return nodes
    .filter((node) => node.id !== fileId)
    .map((node) => {
      if (node.isDirectory && node.children) {
        return {
          ...node,
          children: deleteFileFromTree(node.children, fileId),
        };
      }
      return node;
    });
}
