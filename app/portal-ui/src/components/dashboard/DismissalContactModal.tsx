// apps/web/src/components/dashboard/DismissalContactModal.tsx

import { useState } from 'react';

import { useCreateDismissalContact } from '@/hooks/use-create-dismissal-contact';

import { useUpdateDismissalContact } from '@/hooks/use-update-dismissal-contact';

export const DismissalContactModal = ({
  contact,
  onClose,
}: any) => {
  const [name, setName] = useState(
    contact?.name || '',
  );

  const [relationship, setRelationship] =
    useState(
      contact?.relationship || '',
    );

  const [phone, setPhone] = useState(
    contact?.phone || '',
  );

  const createMutation =
    useCreateDismissalContact();

  const updateMutation =
    useUpdateDismissalContact();

  const loading =
    createMutation.isPending ||
    updateMutation.isPending;

  const handleSubmit = async () => {
    const payload = {
      name,
      relationship,
      phone,
    };

    try {
      if (contact?.id) {
        await updateMutation.mutateAsync({
          id: contact.id,
          payload,
        });
      } else {
        await createMutation.mutateAsync(
          payload,
        );
      }

      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-[520px] p-6 rounded-2xl border-4 border-slate-900 space-y-5">

        <h2 className="text-xl font-black uppercase">
          {contact
            ? 'Edit Contact'
            : 'Add Contact'}
        </h2>

        <div className="space-y-4">

          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full border-4 border-slate-900 rounded-xl p-4 font-bold"
          />

          <input
            placeholder="Relationship"
            value={relationship}
            onChange={(e) =>
              setRelationship(
                e.target.value,
              )
            }
            className="w-full border-4 border-slate-900 rounded-xl p-4 font-bold"
          />

          <input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="w-full border-4 border-slate-900 rounded-xl p-4 font-bold"
          />
        </div>

        <div className="flex gap-3 pt-2">

          <button
            onClick={onClose}
            className="flex-1 border-4 p-3 font-black"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-sky-400 text-slate-900 font-black border-4 p-3"
          >
            {loading
              ? 'Saving...'
              : 'Save Contact'}
          </button>
        </div>
      </div>
    </div>
  );
};