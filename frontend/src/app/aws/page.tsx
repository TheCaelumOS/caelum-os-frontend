import Desktop from '../../components/Desktop';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "AWS Manager - CaelumOS",
  description: "CaelumOS AWS Cloud Console Manager",
};

export default function AwsPage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#2c001e]">
      <Desktop />
    </main>
  );
}
