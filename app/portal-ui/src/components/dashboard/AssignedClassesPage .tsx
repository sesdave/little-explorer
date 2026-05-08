// apps/web/src/pages/dashboard/AssignedClassesPage.tsx

import { useNavigate } from 'react-router-dom';

import {
  Users,
  CheckCircle2,
  Clock3,
  ArrowLeft,
  School,
} from 'lucide-react';

import { useAssignedClasses } from '@/hooks/useAssignedClasses';

import { Button } from '@/components/ui/Button';

export const AssignedClassesPage = () => {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
  } = useAssignedClasses();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white border-4 border-slate-900 rounded-[2rem] p-10 shadow-[8px_8px_0px_0px_#0f172a]">
          <p className="font-black uppercase text-slate-400 animate-pulse">
            Loading assigned classes...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-rose-100 border-4 border-rose-500 rounded-[2rem] p-10">
          <p className="font-black text-rose-600 uppercase">
            Failed to load classes
          </p>
        </div>
      </div>
    );
  }

  const session = data?.session;
  const children = data?.children || [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">

      {/* HEADER */}
      <header className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[10px_10px_0px_0px_#0f172a]">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div>
            <div className="flex items-center gap-3 mb-3">

              <div className="bg-sky-400 p-3 rounded-2xl border-4 border-slate-900">
                <School
                  size={28}
                  className="text-slate-900"
                />
              </div>

              <div>
                <h1 className="text-4xl font-black uppercase italic text-slate-900">
                  Assigned Classes
                </h1>

                <p className="font-bold text-slate-500 text-sm uppercase tracking-wider mt-1">
                  {session?.name}
                </p>
              </div>
            </div>

            <p className="font-bold text-slate-600 max-w-2xl">
              View enrolled classes, registration status,
              and available class information for your children.
            </p>
          </div>

          <Button
            onClick={() =>
              navigate('/dashboard')
            }
            className="
              bg-white text-slate-900
              border-4 border-slate-900
              font-black
              px-6 py-4
              w-full lg:w-auto
            "
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* CHILDREN */}
      <div className="space-y-8">

        {children.length === 0 ? (
          <div className="bg-white border-4 border-slate-900 rounded-[2rem] p-10 text-center shadow-[8px_8px_0px_0px_#0f172a]">

            <p className="text-xl font-black uppercase text-slate-900">
              No children added yet
            </p>

            <p className="mt-3 text-slate-500 font-bold">
              Add children to begin enrollment.
            </p>
          </div>
        ) : (
          children.map((child: any) => {
            const registration =
              child.registrations?.[0];

            const assignedClass =
              registration?.class;

            return (
              <div
                key={child.id}
                className="
                  bg-white border-4 border-slate-900
                  rounded-[2.5rem]
                  overflow-hidden
                  shadow-[10px_10px_0px_0px_#0f172a]
                "
              >

                {/* CHILD HEADER */}
                <div className="bg-slate-900 text-white p-6">

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                    <div className="flex items-center gap-5">

                      <div className="
                        w-20 h-20 rounded-[1.5rem]
                        overflow-hidden border-4 border-white
                        bg-slate-200 flex items-center justify-center
                      ">
                        {child.photoUrl ? (
                          <img
                            src={child.photoUrl}
                            alt={child.firstName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users size={28} className="text-slate-500" />
                        )}
                      </div>

                      <div>
                        <h2 className="text-2xl font-black uppercase italic">
                          {child.firstName} {child.lastName}
                        </h2>

                        <p className="text-xs uppercase tracking-widest font-bold text-slate-300 mt-1">
                          Child Enrollment Summary
                        </p>
                      </div>
                    </div>

                    {registration?.status ? (
                      <div
                        className={`
                          flex items-center gap-2
                          px-5 py-3 rounded-2xl border-4
                          font-black uppercase text-xs tracking-widest
                          w-fit

                          ${
                            registration.status === 'CONFIRMED'
                              ? 'bg-emerald-400 border-emerald-200 text-slate-900'
                              : 'bg-amber-300 border-amber-100 text-slate-900'
                          }
                        `}
                      >
                        {registration.status === 'CONFIRMED' ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <Clock3 size={18} />
                        )}

                        {registration.status}
                      </div>
                    ) : (
                      <div className="
                        bg-rose-400 text-white
                        px-5 py-3 rounded-2xl
                        border-4 border-rose-200
                        font-black uppercase text-xs tracking-widest
                        w-fit
                      ">
                        Not Assigned
                      </div>
                    )}
                  </div>
                </div>

                {/* BODY */}
                <div className="p-8">

                  {assignedClass ? (
                    <div className="grid lg:grid-cols-4 gap-5">

                      <div className="
                        border-4 border-slate-900
                        rounded-[2rem]
                        p-5 bg-sky-50
                      ">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          Assigned Class
                        </p>

                        <h3 className="text-2xl font-black uppercase italic text-slate-900">
                          {assignedClass.name}
                        </h3>
                      </div>

                      <div className="
                        border-4 border-slate-900
                        rounded-[2rem]
                        p-5 bg-amber-50
                      ">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          Age Group
                        </p>

                        <h3 className="text-2xl font-black text-slate-900">
                          {assignedClass.ageMin} - {assignedClass.ageMax}
                        </h3>
                      </div>

                      <div className="
                        border-4 border-slate-900
                        rounded-[2rem]
                        p-5 bg-emerald-50
                      ">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          Capacity
                        </p>

                        <h3 className="text-2xl font-black text-slate-900">
                          {assignedClass.registrationsCount}/
                          {assignedClass.capacity}
                        </h3>
                      </div>

                      <div className="
                        border-4 border-slate-900
                        rounded-[2rem]
                        p-5 bg-rose-50
                      ">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          Spots Left
                        </p>

                        <h3 className="text-2xl font-black text-slate-900">
                          {Math.max(
                            0,
                            assignedClass.capacity -
                              assignedClass.registrationsCount,
                          )}
                        </h3>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};