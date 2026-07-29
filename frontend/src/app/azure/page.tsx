import Desktop from '../../components/Desktop';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Azure Manager - CaelumOS",
  description: "CaelumOS Azure Cloud Dashboard Manager",
};

export default function AzurePage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#2c001e]">
      <Desktop />
    </main>
  );
}
