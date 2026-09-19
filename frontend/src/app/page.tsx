import LandingPage from '../components/marketing/LandingPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "CaelumOS — Your Infrastructure. One Unified Environment.",
  description: "CaelumOS unifies multi-cloud management, container runtimes, infrastructure-as-code, and developer tooling into a single coherent operating system.",
};

export default function Home() {
  return <LandingPage />;
}
