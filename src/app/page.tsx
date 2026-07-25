import Desktop from '../components/Desktop';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "CaelumOS | Ubuntu GNOME AI Operating System",
  description: "CaelumOS browser-based Ubuntu desktop environment for Cloud Infrastructure and AI orchestration.",
};

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#2c001e]">
      <Desktop />
    </main>
  );
}
