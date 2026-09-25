const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Resiliently locate the kubectl executable on Windows, macOS, or Linux
 */
function getKubectlBinary() {
  const candidates = [
    'kubectl.exe',
    'kubectl',
    'C:\\Program Files\\Kubernetes\\Minikube\\kubectl.exe',
    'C:\\Users\\karth\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Kubernetes.kubectl_Microsoft.Winget.Source_8wekyb3d8bbwe\\kubectl.exe',
    'C:\\Program Files\\Docker\\Docker\\resources\\bin\\kubectl.exe',
    '/usr/local/bin/kubectl',
    '/usr/bin/kubectl',
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

/**
 * Asynchronous, non-blocking kubectl CLI runner
 */
function runKubectl(args, timeoutMs = 8000) {
  const bin = getKubectlBinary();
  const userHome = process.env.USERPROFILE || process.env.HOME || '';
  const kubeConfig = process.env.KUBECONFIG || path.join(userHome, '.kube', 'config');
  const env = {
    ...process.env,
    KUBECONFIG: kubeConfig,
  };

  return new Promise((resolve, reject) => {
    execFile(
      bin,
      args,
      {
        encoding: 'utf8',
        env,
        timeout: timeoutMs,
        maxBuffer: 10 * 1024 * 1024,
        windowsHide: true,
      },
      (err, stdout, stderr) => {
        if (err) {
          err.stdout = stdout;
          err.stderr = stderr;
          return reject(err);
        }
        resolve(stdout);
      }
    );
  });
}

/**
 * Fast health check: verifies if cluster control plane responds
 */
async function checkClusterConnection() {
  try {
    const out = await runKubectl(['cluster-info', '--request-timeout=2s'], 3000);
    return out.includes('is running at') || out.includes('Kubernetes control plane');
  } catch {
    return false;
  }
}

async function getContexts() {
  try {
    const current = (await runKubectl(['config', 'current-context'], 3000)).trim();
    const out = await runKubectl(['config', 'get-contexts', '-o', 'name'], 3000);
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
  await runKubectl(['config', 'use-context', contextName], 5000);
  return { success: true, currentContext: contextName };
}

async function getClusterSummary() {
  let context = 'local';
  try {
    const c = await runKubectl(['config', 'current-context'], 2500);
    if (c) context = c.trim();
  } catch {}

  let server = 'unknown';
  try {
    const s = await runKubectl(['config', 'view', '--minify', '-o', 'jsonpath={.clusters[0].cluster.server}'], 2500);
    if (s) server = s.trim();
  } catch {}

  const isUp = await checkClusterConnection();
  if (!isUp) {
    return {
      connected: false,
      context,
      server,
      version: '',
      status: 'unavailable',
      error: 'Kubernetes cluster is not running. Start Minikube, Docker Desktop Kubernetes, or Kind to connect automatically.',
      nodeCount: 0,
      podCount: 0,
      deploymentCount: 0,
      serviceCount: 0,
      namespaceCount: 0,
    };
  }

  try {
    const [nodes, namespaces, pods, deployments, services] = await Promise.all([
      listNodes().catch(() => []),
      listNamespaces().catch(() => []),
      listPods('all').catch(() => []),
      listDeployments('all').catch(() => []),
      listServices('all').catch(() => []),
    ]);

    const isReady = nodes.some(n => n.status === 'Ready');
    const version = nodes[0]?.version || 'v1.30.0';

    return {
      connected: true,
      context: context || 'local',
      server,
      version,
      status: isReady ? 'Ready' : 'Connected',
      nodeCount: nodes.length,
      podCount: pods.length,
      deploymentCount: deployments.length,
      serviceCount: services.length,
      namespaceCount: namespaces.length,
    };
  } catch (err) {
    return {
      connected: false,
      context,
      server,
      status: 'unavailable',
      error: err.message || 'Kubernetes cluster unreachable.',
      nodeCount: 0,
      podCount: 0,
      deploymentCount: 0,
      serviceCount: 0,
      namespaceCount: 0,
    };
  }
}

async function listNodes() {
  try {
    const out = await runKubectl(['get', 'nodes', '-o', 'json', '--request-timeout=4s'], 5000);
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
    const out = await runKubectl(['get', 'namespaces', '-o', 'json', '--request-timeout=4s'], 5000);
    const json = JSON.parse(out);
    return (json.items || []).map(ns => ns.metadata?.name || 'unknown').filter(Boolean);
  } catch {
    return [];
  }
}

async function listPods(namespace) {
  try {
    const args = ['get', 'pods', '-o', 'json', '--request-timeout=5s'];
    if (!namespace || namespace === 'all') {
      args.push('-A');
    } else {
      args.push('-n', namespace);
    }
    const out = await runKubectl(args, 6000);
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

async function getPodLogs(namespace, name, container, tail = 200) {
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!name || !safeRegex.test(name) || !namespace || !safeRegex.test(namespace)) {
    throw new Error('Invalid pod or namespace identifier');
  }
  const safeTail = Math.min(Math.max(1, Number(tail) || 200), 1000);
  const args = ['logs', name, '-n', namespace, `--tail=${safeTail}`, '--request-timeout=5s'];
  if (container && safeRegex.test(container)) {
    args.push('-c', container);
  }
  try {
    const out = await runKubectl(args, 6000);
    return out || 'No log output found.';
  } catch (err) {
    return `Error fetching logs: ${err.message || 'Log retrieval failed'}`;
  }
}

async function restartPod(namespace, name) {
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!name || !safeRegex.test(name) || !namespace || !safeRegex.test(namespace)) {
    throw new Error('Invalid pod or namespace identifier');
  }
  await runKubectl(['delete', 'pod', name, '-n', namespace, '--request-timeout=8s'], 9000);
  return { success: true, message: `Pod ${name} in namespace ${namespace} restarted.` };
}

async function deletePod(namespace, name) {
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!name || !safeRegex.test(name) || !namespace || !safeRegex.test(namespace)) {
    throw new Error('Invalid pod or namespace identifier');
  }
  await runKubectl(['delete', 'pod', name, '-n', namespace, '--request-timeout=8s'], 9000);
  return { success: true, message: `Pod ${name} in namespace ${namespace} deleted.` };
}

async function listDeployments(namespace) {
  try {
    const args = ['get', 'deployments', '-o', 'json', '--request-timeout=5s'];
    if (!namespace || namespace === 'all') {
      args.push('-A');
    } else {
      args.push('-n', namespace);
    }
    const out = await runKubectl(args, 6000);
    const json = JSON.parse(out);
    return (json.items || []).map(dep => ({
      name: dep.metadata?.name || 'unknown',
      namespace: dep.metadata?.namespace || 'default',
      desired: dep.spec?.replicas ?? 1,
      ready: dep.status?.readyReplicas ?? 0,
      available: dep.status?.availableReplicas ?? 0,
      updated: dep.status?.updatedReplicas ?? 0,
      replicas: `${dep.status?.readyReplicas || 0}/${dep.spec?.replicas || 1}`,
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
  await runKubectl(['scale', 'deployment', name, `--replicas=${num}`, '-n', ns, '--request-timeout=8s'], 9000);
  return { success: true, name, replicas: num, namespace: ns };
}

async function deleteDeployment(namespace, name) {
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!name || !safeRegex.test(name)) throw new Error('Invalid deployment name');
  const ns = (namespace && safeRegex.test(namespace)) ? namespace : 'default';
  await runKubectl(['delete', 'deployment', name, '-n', ns, '--request-timeout=8s'], 9000);
  return { success: true, message: `Deployment ${name} deleted from ${ns}` };
}

async function createDeployment(body) {
  const { name, namespace = 'default', image, replicas = 1 } = body || {};
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!name || !safeRegex.test(name)) throw new Error('Invalid deployment name');
  if (!image) throw new Error('Container image is required');

  const args = ['create', 'deployment', name, `--image=${image}`, '-n', namespace, '--request-timeout=10s'];
  await runKubectl(args, 11000);
  if (replicas > 1) {
    await runKubectl(['scale', 'deployment', name, `--replicas=${replicas}`, '-n', namespace, '--request-timeout=8s'], 9000);
  }
  return { success: true, name, namespace, image, replicas };
}

async function listStatefulSets(namespace) {
  try {
    const args = ['get', 'statefulsets', '-o', 'json', '--request-timeout=5s'];
    if (!namespace || namespace === 'all') {
      args.push('-A');
    } else {
      args.push('-n', namespace);
    }
    const out = await runKubectl(args, 6000);
    const json = JSON.parse(out);
    return (json.items || []).map(ss => ({
      name: ss.metadata?.name || 'unknown',
      namespace: ss.metadata?.namespace || 'default',
      desired: ss.spec?.replicas ?? 1,
      ready: ss.status?.readyReplicas ?? 0,
      current: ss.status?.currentReplicas ?? 0,
      updated: ss.status?.updatedReplicas ?? 0,
      replicas: `${ss.status?.readyReplicas || 0}/${ss.spec?.replicas || 1}`,
      serviceName: ss.spec?.serviceName || 'None',
      age: ss.metadata?.creationTimestamp || '',
      images: (ss.spec?.template?.spec?.containers || []).map(c => c.image),
    }));
  } catch {
    return [];
  }
}

async function listServices(namespace) {
  try {
    const args = ['get', 'services', '-o', 'json', '--request-timeout=5s'];
    if (!namespace || namespace === 'all') {
      args.push('-A');
    } else {
      args.push('-n', namespace);
    }
    const out = await runKubectl(args, 6000);
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
  const { name, namespace = 'default', type = 'ClusterIP', port = 80, targetPort = 80 } = body || {};
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!name || !safeRegex.test(name)) throw new Error('Invalid service name');

  const args = ['create', 'service', type.toLowerCase(), name, `--tcp=${port}:${targetPort}`, '-n', namespace, '--request-timeout=10s'];
  await runKubectl(args, 11000);
  return { success: true, name, namespace, type, port };
}

async function deleteService(namespace, name) {
  const safeRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!name || !safeRegex.test(name)) throw new Error('Invalid service name');
  const ns = (namespace && safeRegex.test(namespace)) ? namespace : 'default';
  await runKubectl(['delete', 'service', name, '-n', ns, '--request-timeout=8s'], 9000);
  return { success: true, message: `Service ${name} deleted from ${ns}` };
}

async function listIngresses(namespace) {
  try {
    const args = ['get', 'ingress', '-o', 'json', '--request-timeout=5s'];
    if (!namespace || namespace === 'all') {
      args.push('-A');
    } else {
      args.push('-n', namespace);
    }
    const out = await runKubectl(args, 6000);
    const json = JSON.parse(out);
    return (json.items || []).map(ing => {
      const hosts = (ing.spec?.rules || []).map(r => r.host).filter(Boolean);
      const loadBalancer = ing.status?.loadBalancer?.ingress?.[0]?.ip || ing.status?.loadBalancer?.ingress?.[0]?.hostname || 'None';
      return {
        name: ing.metadata?.name || 'unknown',
        namespace: ing.metadata?.namespace || 'default',
        hosts: hosts.join(', ') || '*',
        address: loadBalancer,
        ports: '80, 443',
        age: ing.metadata?.creationTimestamp || '',
      };
    });
  } catch {
    return [];
  }
}

async function listConfigMaps(namespace) {
  try {
    const args = ['get', 'configmaps', '-o', 'json', '--request-timeout=5s'];
    if (!namespace || namespace === 'all') {
      args.push('-A');
    } else {
      args.push('-n', namespace);
    }
    const out = await runKubectl(args, 6000);
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
    const args = ['get', 'secrets', '-o', 'json', '--request-timeout=5s'];
    if (!namespace || namespace === 'all') {
      args.push('-A');
    } else {
      args.push('-n', namespace);
    }
    const out = await runKubectl(args, 6000);
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
    const args = ['get', 'events', '--sort-by=.metadata.creationTimestamp', '-o', 'json', '--request-timeout=5s'];
    if (!namespace || namespace === 'all') {
      args.push('-A');
    } else {
      args.push('-n', namespace);
    }
    const out = await runKubectl(args, 6000);
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
  checkClusterConnection,
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
  listStatefulSets,
  listServices,
  createService,
  deleteService,
  listIngresses,
  listConfigMaps,
  listSecrets,
  listEvents,
};
