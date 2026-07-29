import Desktop from '../../../components/Desktop';

export function generateStaticParams() {
  return [
    { tab: 'vms' },
    { tab: 'storage' },
    { tab: 'resource-groups' },
    { tab: 'network' },
    { tab: 'functions' },
    { tab: 'keyvault' },
    { tab: 'monitor' },
    { tab: 'cost' }
  ];
}

export default function AzureTabPage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#2c001e]">
      <Desktop />
    </main>
  );
}
