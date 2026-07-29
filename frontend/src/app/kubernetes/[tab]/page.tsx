import Desktop from '../../../components/Desktop';

export function generateStaticParams() {
  return [
    { tab: 'clusters' },
    { tab: 'nodes' },
    { tab: 'namespaces' },
    { tab: 'pods' },
    { tab: 'deployments' },
    { tab: 'statefulsets' },
    { tab: 'services' },
    { tab: 'ingress' },
    { tab: 'logs' }
  ];
}

export default function KubernetesTabPage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#2c001e]">
      <Desktop />
    </main>
  );
}
