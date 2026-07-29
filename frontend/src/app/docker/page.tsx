import Desktop from '../../components/Desktop';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Docker Manager - CaelumOS",
  description: "CaelumOS Docker Containerizer Manager",
};

export default function DockerPage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#2c001e]">
      <Desktop />
    </main>
  );
}
