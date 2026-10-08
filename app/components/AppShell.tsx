import { BottomNav } from "@/app/components/BottomNav";
import { MobileTopBar } from "@/app/components/MobileTopBar";
import { TopBar } from "@/app/components/TopBar";

type Props = {
  isAdmin: boolean;
  anonHandle: string;
  pendingMatchCount: number;
  mobileHeader?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({
  isAdmin,
  anonHandle,
  pendingMatchCount,
  mobileHeader,
  children,
}: Props) {
  return (
    <div className="flex min-h-full flex-1 flex-col md:min-h-screen">
      <div className="md:hidden">
        {mobileHeader ?? <MobileTopBar isAdmin={isAdmin} />}
      </div>
      <div className="hidden md:block">
        <TopBar anonHandle={anonHandle} isAdmin={isAdmin} />
      </div>
      <main className="flex flex-1 flex-col pb-[calc(5rem+env(safe-area-inset-bottom))] [@media(min-height:700px)]:pb-[calc(7.5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <BottomNav pendingMatchCount={pendingMatchCount} />
    </div>
  );
}
