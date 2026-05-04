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

  const {
    children,
    session,
    parentName,
    recentPayments,
    activeRegistrations,
  } = familyData;

  useEffect(() => {
    if (children) setChildren(children);
  }, [children, setChildren]);

  const childrenNames = useMemo(() => {
    if (!children?.length) return 'your little explorers';
    const names = children.map((c: any) => c.firstName);
    if (names.length === 1) return names[0];
    const last = names.pop();
    return `${names.join(', ')} and ${last}`;
  }, [children]);

  const { needsEnrollment, pendingApplication } = useEnrollmentStatus({
    children: familyData.children,
    session: familyData.session,
    pendingApplication: familyData.pendingApplication,
  });

  const handlePrimaryAction = () => {
    if (pendingApplication?.id) {
      navigate(`/dashboard/payment/${pendingApplication.id}`);
      return;
    }

    navigate('/dashboard/register');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10 pb-20">

      {/* HEADER */}
      <header className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase italic">
              Welcome, {parentName || 'Explorer'}
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
              Active Session: <span className="text-sky-500">{session?.name}</span>
            </p>
          </div>

          <div className="hidden lg:flex gap-4">
            {pendingApplication ? (
              <EnrollmentButton
                onClick={handlePrimaryAction}
                variant="payment"
              />
            ) : needsEnrollment ? (
              <EnrollmentButton onClick={handlePrimaryAction} />
            ) : (
              <SystemStatus />
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="flex flex-col lg:flex-row gap-12">

        <main className="flex-1 space-y-12">
          <FamilyOverview />

          <section className="bg-amber-100 rounded-[3.5rem] p-10 border-4 border-slate-900 shadow-[12px_12px_0px_0px_#0f172a] flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black uppercase italic">
                Ready to Explore?
              </h2>
              <p className="font-bold text-slate-700">
                Check available classes for {childrenNames}.
              </p>
            </div>

            <Button
              onClick={handlePrimaryAction}
              className="bg-rose-400 text-white border-4 border-slate-900 px-10 py-5 text-xl font-black"
            >
               BROWSE CLASSES
            </Button>
          </section>
        </main>

        {/* SIDEBAR */}
        <aside className="w-full lg:w-[380px]">
          <DashboardSidebar
            payments={recentPayments}
            registrations={activeRegistrations}
          />
        </aside>

      </div>
    </div>
  );
};