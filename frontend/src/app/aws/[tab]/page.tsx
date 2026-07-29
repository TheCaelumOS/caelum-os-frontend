import Desktop from '../../../components/Desktop';

export function generateStaticParams() {
  return [
    { tab: 'ec2' },
    { tab: 's3' },
    { tab: 'rds' },
    { tab: 'lambda' },
    { tab: 'vpc' },
    { tab: 'iam' },
    { tab: 'cloudwatch' },
    { tab: 'billing' }
  ];
}

export default function AwsTabPage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#2c001e]">
      <Desktop />
    </main>
  );
}
