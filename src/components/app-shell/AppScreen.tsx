import type { ReactNode } from "react";

type AppScreenProps = {
  children: ReactNode;
};

export function AppScreen({ children }: AppScreenProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-5 text-white sm:px-6">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_34%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_38%)]" />
      <div className="mx-auto min-h-[calc(100vh-2.5rem)] w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.05] p-3 shadow-2xl shadow-black/30 backdrop-blur md:max-w-5xl">
        <div className="min-h-[calc(100vh-4rem)] rounded-[1.5rem] bg-slate-950/75 px-4 pb-24 pt-5 md:px-6">
          {children}
        </div>
      </div>
    </main>
  );
}
