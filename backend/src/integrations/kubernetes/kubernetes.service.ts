import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';

@Injectable()
export class KubernetesService {
  private kc: k8s.KubeConfig;
  private k8sApi: k8s.CoreV1Api;
  private appsApi: k8s.AppsV1Api;
  private isLoaded = false;

  constructor() {
    try {
      this.kc = new k8s.KubeConfig();
      this.kc.loadFromDefault();
      this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
      this.appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
      this.isLoaded = true;
    } catch {
      console.warn('Kubernetes Kubeconfig not found. Running in mock deployment provider mode.');
    }
  }

  async listNamespaces() {
    if (!this.isLoaded) {
      return ['default', 'kube-system', 'kube-public', 'caelum-core', 'caelum-ingress'];
    }
    try {
      const res = await this.k8sApi.listNamespace();
      return (res.items || []).map(ns => ns.metadata?.name).filter(Boolean);
    } catch {
      return ['default', 'kube-system', 'caelum-core'];
    }
  }

  async listPods(namespace?: string) {
    const ns = namespace || 'default';
    if (!this.isLoaded) {
      return [
        { name: 'caelum-web-os-7f89bcd9-a1b2c', namespace: ns, status: 'Running', ip: '10.244.0.12', node: 'docker-desktop-worker', age: '4h' },
        { name: 'caelum-api-gateway-5f4b9da8-9c8d7', namespace: ns, status: 'Running', ip: '10.244.0.13', node: 'docker-desktop-worker', age: '4h' },
        { name: 'caelum-db-postgres-0', namespace: ns, status: 'Running', ip: '10.244.1.4', node: 'docker-desktop-worker', age: '12d' },
        { name: 'caelum-redis-cache-7d9bcd-x92kl', namespace: ns, status: 'Running', ip: '10.244.1.5', node: 'docker-desktop-worker', age: '12d' },
      ];
    }
    try {
      const res = await this.k8sApi.listNamespacedPod({ namespace: ns });
      return (res.items || []).map(pod => ({
        name: pod.metadata?.name,
        namespace: pod.metadata?.namespace,
        status: pod.status?.phase,
        ip: pod.status?.podIP,
        node: pod.spec?.nodeName,
        age: pod.metadata?.creationTimestamp,
      }));
    } catch {
      return [];
    }
  }

  async listDeployments(namespace?: string) {
    const ns = namespace || 'default';
    if (!this.isLoaded) {
      return [
        { name: 'caelum-web-os', namespace: ns, replicas: '3/3', available: 3, age: '12d' },
        { name: 'caelum-api-gateway', namespace: ns, replicas: '2/2', available: 2, age: '12d' },
        { name: 'caelum-ai-service-broker', namespace: ns, replicas: '1/1', available: 1, age: '4h' },
      ];
    }
    try {
      const res = await this.appsApi.listNamespacedDeployment({ namespace: ns });
      return (res.items || []).map(dep => ({
        name: dep.metadata?.name,
        namespace: dep.metadata?.namespace,
        replicas: `${dep.status?.readyReplicas || 0}/${dep.status?.replicas || 0}`,
        available: dep.status?.availableReplicas || 0,
        age: dep.metadata?.creationTimestamp,
      }));
    } catch {
      return [];
    }
  }
}
