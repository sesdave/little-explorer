// apps/web/src/pages/dashboard/DashboardPage.tsx
import { useEffect, useMemo } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useFamilyStore } from '@/store/family.store';
import { FamilyOverview } from '@/components/dashboard/FamilyOverview';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/Button';
import { useEnrollmentStatus } from '@/hooks/use-enrollmentStatus';
import { EnrollmentButton } from '@/components/dashboard/EnrollmentButton';
import { SystemStatus } from '@/components/dashboard/SystemStatus';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const familyData = useLoaderData() as any;
  const setChildren = useFamilyStore((state) => state.setChildren);

  const { children, session, parentName, recentPayments, activeRegistrations } = familyData;
  console.log("family Data", familyData);

  useEffect(() => {
    if (children) setChildren(children);
  }, [children, setChildren]);

  const childrenNames = useMemo(() => {
    if (!children || children.length === 0) return "your little explorers";
    const names = children.map((c: any) => c.firstName);
    if (names.length === 1) return names[0];
    const last = names.pop();
    return `${names.join(', ')} and ${last}`;
  }, [children]);

  const { needsEnrollment, activeSessionName } = useEnrollmentStatus({
    children: familyData.children,
    session: familyData.session
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 🏛️ 1. TOP LEVEL HEADER: Full Width */}
      <header className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
              Welcome, {parentName || 'Explorer'}
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
              Active Session: <span className="text-sky-500">{session?.name || 'Loading...'}</span>
            </p>
          </div>
          <div className="hidden lg:flex gap-4">
             {needsEnrollment ? (
              <EnrollmentButton onClick={() => navigate('/dashboard/register')} />
            ) : (
              <SystemStatus />
            )}
          </div>
        </div>
      </header>

      {/* 🏛️ 2. THE MAIN SPLIT: Separating the Family World from the Sidebar */}
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* --- LEFT SIDE: THE FAMILY CONTENT (Independent Flow) --- */}
        <main className="flex-1 space-y-12">
          <section>
            <h2 className="text-xl font-black uppercase italic mb-6 text-slate-900"></h2>
            <FamilyOverview />
          </section>

          {/* Registration CTA is now isolated within the main flow */}
          <section className="bg-amber-100 rounded-[3.5rem] p-10 border-4 border-slate-900 shadow-[12px_12px_0px_0px_#0f172a] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">Ready to Explore?</h2>
              <p className="font-bold text-slate-700 mt-2">Check out the new classes available for {childrenNames}.</p>
            </div>
            <Button 
              onClick={() => navigate('/dashboard/register')}
              className="bg-rose-400 text-white border-4 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all px-12 py-6 text-xl font-black"
            >
              BROWSE CLASSES
            </Button>
          </section>
        </main>

        {/* --- RIGHT SIDE: THE ISOLATED SIDEBAR --- */}
        <aside className="w-full lg:w-[380px]">
          <div className="lg:sticky lg:top-8">
             <DashboardSidebar 
               payments={recentPayments} 
               registrations={activeRegistrations} 
             />
          </div>
        </aside>

      </div>
    </div>
  );
};