const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Resiliently locate the kubectl executable on Windows, macOS, or Linux
 */
function getKubectlBinary() {
  const candidates = [
    'C:\\Program Files\\Kubernetes\\Minikube\\kubectl.exe',
    'C:\\Users\\karth\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Kubernetes.kubectl_Microsoft.Winget.Source_8wekyb3d8bbwe\\kubectl.exe',
    'C:\\Program Files\\Docker\\Docker\\resources\\bin\\kubectl.exe',
    '/usr/local/bin/kubectl',
    '/usr/bin/kubectl',
    'kubectl.exe',
    'kubectl',
  ];
  for (const c of candidates) {
    if (c.includes('\\') || c.includes('/')) {
      if (fs.existsSync(c)) {
        return c;
      }
    }
  }
  return 'kubectl';
}

function runKubectl(args, timeoutMs = 15000) {
  const bin = getKubectlBinary();
  const userHome = process.env.USERPROFILE || process.env.HOME || '';
  const kubeConfig = process.env.KUBECONFIG || path.join(userHome, '.kube', 'config');
  const env = {
    ...process.env,
    KUBECONFIG: kubeConfig,
  };

  return execFileSync(bin, args, {
    encoding: 'utf8',
    env,
    timeout: timeoutMs,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

async function getContexts() {
  try {
    const current = runKubectl(['config', 'current-context'], 4000).trim();
    const out = runKubectl(['config', 'get-contexts', '-o', 'name'], 5000);
    const contexts = out.split(/\r?\n/).map(c => c.trim()).filter(Boolean);
    return {
      current,
      contexts,
    };
  } catch (err) {
    return { current: '', contexts: [] };
  }
}

async function switchContext(contextName) {
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!contextName || !safeRegex.test(contextName)) {
    throw new Error('Invalid context name format');
  }
  runKubectl(['config', 'use-context', contextName], 8000);
  return { success: true, currentContext: contextName };
}

async function getClusterSummary() {
  try {
    let context = 'unknown';
    try {
      context = runKubectl(['config', 'current-context'], 4000).trim();
    } catch {}

    let server = 'unknown';
    try {
      const s = runKubectl(['config', 'view', '--minify', '-o', 'jsonpath={.clusters[0].cluster.server}'], 4000).trim();
      if (s) server = s;
    } catch {}

    const [nodes, namespaces, pods, deployments, services] = await Promise.all([
      listNodes().catch(() => []),
      listNamespaces().catch(() => []),
      listPods('all').catch(() => []),
      listDeployments('all').catch(() => []),
      listServices('all').catch(() => []),
    ]);

    const isReady = nodes.some(n => n.status === 'Ready');
    const version = nodes[0]?.version || 'v1.34.0';

    return {
      connected: nodes.length > 0 || isReady,
      context: context || 'local',
      server,
      version,
      status: isReady ? 'Ready' : (nodes.length > 0 ? 'Connected' : 'Offline'),
      nodeCount: nodes.length,
      podCount: pods.length,
      deploymentCount: deployments.length,
      serviceCount: services.length,
      namespaceCount: namespaces.length,
    };
  } catch (err) {
    return {
      connected: false,
      status: 'unavailable',
      error: err.message || 'Kubernetes cluster unreachable. Ensure local cluster (Minikube/Kind/Docker Desktop) is running.',
    };
  }
}

async function listNodes() {
  try {
    const out = runKubectl(['get', 'nodes', '-o', 'json'], 10000);
    const json = JSON.parse(out);
    return (json.items || []).map(node => {
      const readyCond = node.status?.conditions?.find(c => c.type === 'Ready');
      const roles = Object.keys(node.metadata?.labels || {})
        .filter(l => l.startsWith('node-role.kubernetes.io/'))
        .map(l => l.split('/')[1])
        .join(', ') || 'control-plane';
      const internalIP = node.status?.addresses?.find(a => a.type === 'InternalIP')?.address || 'N/A';

      return {
        name: node.metadata?.name || 'unknown',
        status: readyCond?.status === 'True' ? 'Ready' : 'NotReady',
        roles,
        version: node.status?.nodeInfo?.kubeletVersion || 'unknown',
        os: node.status?.nodeInfo?.osImage || 'Linux',
        internalIP,
        age: node.metadata?.creationTimestamp || '',
        creationTimestamp: node.metadata?.creationTimestamp || '',
        cpuCapacity: node.status?.capacity?.cpu || 'N/A',
        memoryCapacity: node.status?.capacity?.memory || 'N/A',
      };
    });
  } catch {
    return [];
  }
}

async function listNamespaces() {
  try {
    const out = runKubectl(['get', 'namespaces', '-o', 'json'], 10000);
    const json = JSON.parse(out);
    return (json.items || []).map(ns => ({
      name: ns.metadata?.name || 'unknown',
      status: ns.status?.phase || 'Active',
      age: ns.metadata?.creationTimestamp || '',
    }));
  } catch {
    return [];
  }
}

async function listPods(namespace) {
  try {
    const args = ['get', 'pods', '-o', 'json'];
    if (!namespace || namespace === 'all') {
      args.push('-A');
    } else {
      args.push('-n', namespace);
    }
    const out = runKubectl(args, 12000);
    const json = JSON.parse(out);
    return (json.items || []).map(pod => {
      const cStatuses = pod.status?.containerStatuses || [];
      const readyContainers = cStatuses.filter(c => c.ready).length;
      const totalContainers = cStatuses.length || (pod.spec?.containers?.length || 1);
      const restarts = cStatuses.reduce((acc, c) => acc + (c.restartCount || 0), 0);
      const image = pod.spec?.containers?.[0]?.image || 'unknown';

      return {
        name: pod.metadata?.name || 'unknown',
        namespace: pod.metadata?.namespace || 'default',
        status: pod.status?.phase || 'Unknown',
        ready: `${readyContainers}/${totalContainers}`,
        restarts,
        age: pod.metadata?.creationTimestamp || '',
        node: pod.spec?.nodeName || 'N/A',
        ip: pod.status?.podIP || 'N/A',
        image,
      };
    });
  } catch {
    return [];
  }
}

async function getPodLogs(namespace, name, container) {
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!name || !safeRegex.test(name) || !namespace || !safeRegex.test(namespace)) {
    throw new Error('Invalid pod or namespace identifier');
  }
  const args = ['logs', name, '-n', namespace, '--tail', '200'];
  if (container && safeRegex.test(container)) {
    args.push('-c', container);
  }
  try {
    const out = runKubectl(args, 10000);
    return out || 'No log output found.';
  } catch (err) {
    return `Error fetching logs: ${err.message}`;
  }
}

async function restartPod(namespace, name) {
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!name || !safeRegex.test(name) || !namespace || !safeRegex.test(namespace)) {
    throw new Error('Invalid pod or namespace identifier');
  }
  runKubectl(['delete', 'pod', name, '-n', namespace], 15000);
  return { success: true, message: `Pod ${name} in namespace ${namespace} restarted.` };
}

async function deletePod(namespace, name) {
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!name || !safeRegex.test(name) || !namespace || !safeRegex.test(namespace)) {
    throw new Error('Invalid pod or namespace identifier');
  }
  runKubectl(['delete', 'pod', name, '-n', namespace], 15000);
  return { success: true, message: `Pod ${name} in namespace ${namespace} deleted.` };
}

async function listDeployments(namespace) {
  try {
    const args = ['get', 'deployments', '-o', 'json'];
    if (!namespace || namespace === 'all') {
      args.push('-A');
    } else {
      args.push('-n', namespace);
    }
    const out = runKubectl(args, 12000);
    const json = JSON.parse(out);
    return (json.items || []).map(dep => ({
      name: dep.metadata?.name || 'unknown',
      namespace: dep.metadata?.namespace || 'default',
      ready: `${dep.status?.readyReplicas || 0}/${dep.spec?.replicas || 1}`,
      upToDate: dep.status?.updatedReplicas || 0,
      available: dep.status?.availableReplicas || 0,
      age: dep.metadata?.creationTimestamp || '',
      images: (dep.spec?.template?.spec?.containers || []).map(c => c.image),
    }));
  } catch {
    return [];
  }
}

async function scaleDeployment(namespace, name, replicas) {
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  const num = parseInt(replicas, 10);
  if (!name || !safeRegex.test(name) || isNaN(num) || num < 0 || num > 50) {
    throw new Error('Invalid scaling parameters.');
  }
  const ns = (namespace && safeRegex.test(namespace)) ? namespace : 'default';
  runKubectl(['scale', 'deployment', name, `--replicas=${num}`, '-n', ns], 12000);
  return { success: true, name, replicas: num, namespace: ns };
}

async function deleteDeployment(namespace, name) {
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!name || !safeRegex.test(name)) throw new Error('Invalid deployment name');
  const ns = (namespace && safeRegex.test(namespace)) ? namespace : 'default';
  runKubectl(['delete', 'deployment', name, '-n', ns], 15000);
  return { success: true, message: `Deployment ${name} deleted from ${ns}` };
}

async function createDeployment(body) {
  const { name, namespace = 'default', image, replicas = 1, port = 80 } = body || {};
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!name || !safeRegex.test(name)) throw new Error('Invalid deployment name');
  if (!image) throw new Error('Container image is required');

  const args = ['create', 'deployment', name, `--image=${image}`, '-n', namespace];
  runKubectl(args, 15000);
  if (replicas > 1) {
    runKubectl(['scale', 'deployment', name, `--replicas=${replicas}`, '-n', namespace], 10000);
  }
  return { success: true, name, namespace, image, replicas };
}

async function listServices(namespace) {
  try {
    const args = ['get', 'services', '-o', 'json'];
    if (!namespace || namespace === 'all') {
      args.push('-A');
    } else {
      args.push('-n', namespace);
    }
    const out = runKubectl(args, 12000);
    const json = JSON.parse(out);
    return (json.items || []).map(svc => {
      const ports = (svc.spec?.ports || []).map(p => `${p.port}:${p.targetPort || p.port}/${p.protocol || 'TCP'}`).join(', ');
      return {
        name: svc.metadata?.name || 'unknown',
        namespace: svc.metadata?.namespace || 'default',
        type: svc.spec?.type || 'ClusterIP',
        clusterIP: svc.spec?.clusterIP || 'None',
        externalIP: svc.status?.loadBalancer?.ingress?.[0]?.ip || 'None',
        ports: ports || 'None',
        age: svc.metadata?.creationTimestamp || '',
      };
    });
  } catch {
    return [];
  }
}

async function createService(body) {
  const { name, namespace = 'default', type = 'ClusterIP', port = 80, targetPort = 80, selector = '' } = body || {};
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!name || !safeRegex.test(name)) throw new Error('Invalid service name');

  // Use kubectl create service
  const args = ['create', 'service', type.toLowerCase(), name, `--tcp=${port}:${targetPort}`, '-n', namespace];
  runKubectl(args, 15000);
  return { success: true, name, namespace, type, port };
}

async function deleteService(namespace, name) {
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!name || !safeRegex.test(name)) throw new Error('Invalid service name');
  const ns = (namespace && safeRegex.test(namespace)) ? namespace : 'default';
  runKubectl(['delete', 'service', name, '-n', ns], 15000);
  return { success: true, message: `Service ${name} deleted from ${ns}` };
}

async function listConfigMaps(namespace) {
  try {
    const args = ['get', 'configmaps', '-o', 'json'];
    if (!namespace || namespace === 'all') {
      args.push('-A');
    } else {
      args.push('-n', namespace);
    }
    const out = runKubectl(args, 10000);
    const json = JSON.parse(out);
    return (json.items || []).map(cm => ({
      name: cm.metadata?.name || 'unknown',
      namespace: cm.metadata?.namespace || 'default',
      dataCount: Object.keys(cm.data || {}).length,
      age: cm.metadata?.creationTimestamp || '',
    }));
  } catch {
    return [];
  }
}

async function listSecrets(namespace) {
  try {
    const args = ['get', 'secrets', '-o', 'json'];
    if (!namespace || namespace === 'all') {
      args.push('-A');
    } else {
      args.push('-n', namespace);
    }
    const out = runKubectl(args, 10000);
    const json = JSON.parse(out);
    return (json.items || []).map(sec => ({
      name: sec.metadata?.name || 'unknown',
      namespace: sec.metadata?.namespace || 'default',
      type: sec.type || 'Opaque',
      dataCount: Object.keys(sec.data || {}).length,
      age: sec.metadata?.creationTimestamp || '',
    }));
  } catch {
    return [];
  }
}

async function listEvents(namespace) {
  try {
    const args = ['get', 'events', '--sort-by=.metadata.creationTimestamp', '-o', 'json'];
    if (!namespace || namespace === 'all') {
      args.push('-A');
    } else {
      args.push('-n', namespace);
    }
    const out = runKubectl(args, 10000);
    const json = JSON.parse(out);
    return (json.items || []).slice(-50).map(evt => ({
      type: evt.type || 'Normal',
      reason: evt.reason || '',
      message: evt.message || '',
      namespace: evt.metadata?.namespace || 'default',
      involvedObject: `${evt.involvedObject?.kind}/${evt.involvedObject?.name}`,
      age: evt.metadata?.creationTimestamp || '',
    }));
  } catch {
    return [];
  }
}

module.exports = {
  getClusterSummary,
  getContexts,
  switchContext,
  listNodes,
  listNamespaces,
  listPods,
  getPodLogs,
  restartPod,
  deletePod,
  listDeployments,
  scaleDeployment,
  deleteDeployment,
  createDeployment,
  listServices,
  createService,
  deleteService,
  listConfigMaps,
  listSecrets,
  listEvents,
};
