import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 pl-[220px] min-h-screen">
        {children}
      </main>
    </div>
  );
}
