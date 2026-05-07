// apps/web/src/components/dashboard/DismissalContactsCard.tsx

import { useState } from 'react';

import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Info,
} from 'lucide-react';


import { useDeleteDismissalContact } from '@/hooks/use-delete-dismissal-contact';
import { DismissalContactModal } from './DismissalContactModal';
import { useDismissalContacts } from '@/hooks/use-dismissal-contacts';

export const DismissalContactsCard = () => {
  const [editing, setEditing] = useState<any>(null);

  const [open, setOpen] = useState(false);

  const {
    data: contacts = [],
    isLoading,
  } = useDismissalContacts();

  const deleteMutation =
    useDeleteDismissalContact();

  const handleDelete = async (
    id: string,
  ) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <>
      <div className="bg-white border-4 border-slate-900 rounded-[2rem] p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">

        {/* HEADER */}
        <div className="flex items-start justify-between mb-5">

          <div>
            <div className="flex items-center gap-2">

              <div className="p-2 bg-sky-400 border-2 border-slate-900 rounded-lg">
                <ShieldCheck
                  size={18}
                  className="text-slate-900"
                />
              </div>

              <h3 className="font-black uppercase text-sm tracking-tight">
                Dismissal Info
              </h3>
            </div>

            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">
              Approved pickup contacts
            </p>
          </div>

          {/* TOOLTIP */}
          <div className="group relative">
            <Info
              size={16}
              className="text-slate-400 cursor-pointer"
            />

            <div className="absolute right-0 top-6 w-64 opacity-0 pointer-events-none group-hover:opacity-100 transition bg-slate-900 text-white text-[10px] p-3 rounded-xl z-50">
              People authorized to pick up your child after VBS or Teens Camp.
            </div>
          </div>
        </div>

        {/* LOADING */}
        {isLoading && (
          <p className="text-[10px] font-bold uppercase text-slate-400">
            Loading contacts...
          </p>
        )}

        {/* CONTACTS */}
        <div className="space-y-3">
          {!isLoading && contacts.length > 0 ? (
            contacts.map((contact: any) => (
              <div
                key={contact.id}
                className="border-2 border-slate-200 rounded-xl p-4 flex justify-between"
              >
                <div>
                  <p className="font-black uppercase text-xs">
                    {contact.name}
                  </p>

                  <p className="text-[10px] font-bold text-slate-500 uppercase">
                    {contact.relationship}
                  </p>

                  {contact.phone && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      {contact.phone}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">

                  <button
                    onClick={() => {
                      setEditing(contact);
                      setOpen(true);
                    }}
                    className="text-slate-400 hover:text-sky-500"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(contact.id)
                    }
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            !isLoading && (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                <p className="text-[10px] font-black uppercase text-slate-400">
                  No dismissal contacts added
                </p>
              </div>
            )
          )}
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="w-full mt-5 flex items-center justify-center gap-2 py-3 border-4 border-slate-900 rounded-2xl bg-sky-400 text-slate-900 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
        >
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      {/* MODAL */}
      {open && (
        <DismissalContactModal
          contact={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
};