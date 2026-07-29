import Desktop from '../../components/Desktop';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Kubernetes Manager - CaelumOS",
  description: "CaelumOS Kubernetes Cluster Orchestrator Manager",
};

export default function KubernetesPage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#2c001e]">
      <Desktop />
    </main>
  );
}
