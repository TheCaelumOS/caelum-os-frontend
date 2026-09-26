import Desktop from '../../components/Desktop';

export default function TaskManagerPage() {
  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#2c001e] select-none">
      <Desktop initialApp="taskmanager" />
    </main>
  );
}
