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
  const childrenFromStore = useFamilyStore((state) => state.children);

  const {
    children,
    session,
    parentName,
    recentPayments,
    activeRegistrations,
    dismissalContacts
  } = familyData;

  useEffect(() => {
    if (children) {
      setChildren(children);
    }
  }, [children, setChildren]);

  const childrenNames = useMemo(() => {
    if (!childrenFromStore?.length) {
      return 'your little explorers';
    }

    const names = childrenFromStore.map((c: any) => c.firstName);

    if (names.length === 1) {
      return names[0];
    }

    const last = names.pop();

    return `${names.join(', ')} and ${last}`;
  }, [childrenFromStore]);

  const {
    needsEnrollment,
    pendingApplication,
    needsPayment,
    maybeProcessing
  } = useEnrollmentStatus({
    children: childrenFromStore,
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

        <div className="flex flex-col gap-6">

          {/* TOP */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>
              <h1 className="text-4xl font-black text-slate-900 uppercase italic">
                Welcome, {parentName || 'Explorer'}
              </h1>

              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
                Active Session:
                <span className="text-sky-500 ml-2">
                  {session?.name}
                </span>
              </p>
            </div>

            <div className="flex gap-4">
              {maybeProcessing ? (
                <EnrollmentButton
                  onClick={()=>{}}
                  variant="processing"
                />
              ) : needsPayment ? (
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

          {/* SCROLLING SESSION THEME */}
          {/* SCROLLING SESSION THEME */}
{/* SCROLLING SESSION THEME */}
{/* SCROLLING SESSION THEME */}
{session?.theme && (
  <div className="relative overflow-hidden border-4 border-slate-900 rounded-[2rem] bg-gradient-to-r from-amber-300 via-rose-300 to-sky-300 shadow-[6px_6px_0px_0px_#0f172a] py-4">
    {/* 1. THE INJECTED ANIMATION CSS */}
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes marquee-scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .custom-marquee-track {
        display: flex !important;
        flex-direction: row !important;
        flex-nowrap: nowrap !important;
        width: max-content;
        animation: marquee-scroll 30s linear infinite;
      }
    `}} />

    <div className="absolute inset-0 bg-white/10 pointer-events-none" />
    
    <div className="flex overflow-hidden select-none">
      <div className="custom-marquee-track">
        
        {/* Set 1 */}
        <div className="flex items-center flex-nowrap">
          {[...Array(6)].map((_, index) => (
            <div key={`a-${index}`} className="flex items-center gap-4 px-8 whitespace-nowrap">
              <span className="text-2xl">✨</span>
              <span className="text-2xl md:text-3xl font-black uppercase italic text-slate-900 tracking-wide">
                {session.theme}
              </span>
              <span className="text-2xl">☀️</span>
            </div>
          ))}
        </div>

        {/* Set 2 (The Duplicate) */}
        <div aria-hidden="true" className="flex items-center flex-nowrap">
          {[...Array(6)].map((_, index) => (
            <div key={`b-${index}`} className="flex items-center gap-4 px-8 whitespace-nowrap">
              <span className="text-2xl">✨</span>
              <span className="text-2xl md:text-3xl font-black uppercase italic text-slate-900 tracking-wide">
                {session.theme ?? 'Jesus is King'}
              </span>
              <span className="text-2xl">☀️</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  </div>
)}
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

            {session.isClassVisible ? (
              <Button
                onClick={() => navigate('/dashboard/classes')}
                className="bg-rose-400 text-white border-4 border-slate-900 px-10 py-5 text-xl font-black"
              >
                BROWSE CLASSES
              </Button>
            ) : null}

          </section>

        </main>

        {/* SIDEBAR */}
        <aside className="w-full lg:w-[380px]">
          <DashboardSidebar
            payments={recentPayments}
            registrations={activeRegistrations}
            dismissalContacts={dismissalContacts}
          />
        </aside>

      </div>
    </div>
  );
};