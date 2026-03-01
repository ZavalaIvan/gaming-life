import { BottomNav } from "@/components/BottomNav";

export default function TabsLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col safe-bottom">
      <main className="flex-1 px-4 pb-6 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
