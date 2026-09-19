import Desktop from '../../components/Desktop';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "CaelumOS Desktop — Unified Infrastructure Environment",
  description: "CaelumOS browser-based desktop environment for cloud infrastructure, containers, and orchestration.",
};

export default function OsPage() {
  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#2c001e] select-none">
      <Desktop />
    </main>
  );
}
