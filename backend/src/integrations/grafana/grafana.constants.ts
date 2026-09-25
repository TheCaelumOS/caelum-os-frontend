export const GRAFANA_LOCAL_PROBE_PORTS = [3000, 3001, 3002, 3003, 8080];
export const GRAFANA_REQUEST_TIMEOUT_MS = 10000;
export const GRAFANA_USER_AGENT = 'CaelumOS-Observability/1.0';

export enum GrafanaConnectionStatus {
  CONNECTED = 'CONNECTED',
  NOT_CONNECTED = 'NOT_CONNECTED',
  UNAVAILABLE = 'UNAVAILABLE',
  ERROR = 'ERROR',
  CONNECTING = 'CONNECTING',
}

export const OBSERVABILITY_METRIC_QUERIES = {
  // Host queries (node_exporter standard)
  CPU_USAGE: '100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
  MEMORY_USAGE: '((node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes) * 100',
  DISK_USAGE: '100 - ((node_filesystem_avail_bytes{mountpoint="/"} * 100) / node_filesystem_size_bytes{mountpoint="/"})',
  NETWORK_RECEIVE: 'sum(rate(node_network_receive_bytes_total[5m]))',
  NETWORK_TRANSMIT: 'sum(rate(node_network_transmit_bytes_total[5m]))',

  // Docker / cAdvisor queries
  CONTAINER_COUNT: 'count(rate(container_cpu_usage_seconds_total{container!=""}[5m]))',
  CONTAINER_CPU: 'sum(rate(container_cpu_usage_seconds_total{container!=""}[5m])) * 100',
  CONTAINER_MEMORY: 'sum(container_memory_usage_bytes{container!=""})',

  // Kubernetes / kube-state-metrics queries
  K8S_NODES: 'count(kube_node_info)',
  K8S_PODS: 'count(kube_pod_info)',
  K8S_POD_RESTARTS: 'sum(increase(kube_pod_container_status_restarts_total[1h]))',
};
