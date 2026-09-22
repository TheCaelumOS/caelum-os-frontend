import Desktop from '../../components/Desktop';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Dashboard - CaelumOS",
  description: "CaelumOS Deploy Summary Dashboard",
};

export default function DashboardPage() {
  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#2c001e] select-none">
      <Desktop />
    </main>
  );
}
