import { useLoaderData } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ReassignModal } from '@/components/admin/ReassignModal';

type Child = {
  childId: string;
  classId: string;
  name: string;
  status: 'PROVISIONAL' | 'CONFIRMED';
};

type ClassItem = {
  id: string;
  name: string;
  capacity: number;
  registered: number;
  availableSpots: number;
  children: Child[];
};

export const AdminClassesPage = () => {
  const { classes } = useLoaderData() as { classes: ClassItem[] };

  const [openClassId, setOpenClassId] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  const toggle = (id: string) => {
    setOpenClassId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* HEADER */}
      <header className="bg-white p-6 rounded-[2rem] border-4 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a]">
        <h1 className="text-3xl font-black uppercase italic text-slate-900">
          Class Management
        </h1>
        <p className="text-slate-500 font-bold text-sm mt-1">
          View and reassign children across classes
        </p>
      </header>

      {/* CLASS LIST */}
      <div className="space-y-5">
        {classes.map((c) => {
          const isOpen = openClassId === c.id;

          return (
            <div
              key={c.id}
              className="
                bg-white border-4 border-slate-900 rounded-[2rem]
                shadow-[8px_8px_0px_0px_#0f172a]
                overflow-hidden transition-all
              "
            >

              {/* CLASS HEADER */}
              <button
                onClick={() => toggle(c.id)}
                className="
                  w-full flex justify-between items-center p-6
                  hover:bg-slate-50 transition
                "
              >
                <div className="text-left">
                  <h2 className="text-xl font-black uppercase">
                    {c.name}
                  </h2>

                  <p className="text-sm font-bold text-slate-500">
                    {c.registered}/{c.capacity} enrolled ·{' '}
                    <span className={c.availableSpots === 0 ? 'text-rose-500' : 'text-emerald-500'}>
                      {c.availableSpots} spots left
                    </span>
                  </p>
                </div>

                <ChevronDown
                  className={`
                    transition-transform duration-300
                    ${isOpen ? 'rotate-180' : ''}
                  `}
                />
              </button>

              {/* CLASS BODY */}
              {isOpen && (
                <div className="border-t-4 border-slate-900 p-6 space-y-4 bg-slate-50">

                  {c.children.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-slate-400 font-bold uppercase text-sm">
                        No children assigned
                      </p>
                    </div>
                  ) : (
                    c.children.map((child) => (
                      <div
                        key={child.childId}
                        className="
                          flex justify-between items-center
                          bg-white border-2 border-slate-900
                          p-4 rounded-xl
                          shadow-[3px_3px_0px_0px_#0f172a]
                        "
                      >
                        <div>
                          <p className="font-black text-slate-900 uppercase">
                            {child.name}
                          </p>

                          <p className="text-xs font-bold text-slate-500">
                            {child.status === 'CONFIRMED' ? (
                              <span className="text-emerald-500">CONFIRMED</span>
                            ) : (
                              <span className="text-amber-500">PROVISIONAL</span>
                            )}
                          </p>
                        </div>

                        {/* ACTION */}
                        <button
                          onClick={() => setSelectedChild(child)}
                          className="
                            text-sm font-black uppercase
                            text-rose-500 hover:text-rose-600
                            transition
                          "
                        >
                          Reassign
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {selectedChild && (
        <ReassignModal
          child={selectedChild}
          classes={classes}
          onClose={() => setSelectedChild(null)}
          onSuccess={() => {
            // optimistic update hook can plug here later
            setSelectedChild(null);
          }}
        />
      )}
    </div>
  );
};