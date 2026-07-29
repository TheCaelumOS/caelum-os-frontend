import Desktop from '../../../components/Desktop';

export function generateStaticParams() {
  return [
    { tab: 'containers' },
    { tab: 'images' },
    { tab: 'networks' },
    { tab: 'volumes' },
    { tab: 'compose' },
    { tab: 'logs' }
  ];
}

export default function DockerTabPage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#2c001e]">
      <Desktop />
    </main>
  );
}
