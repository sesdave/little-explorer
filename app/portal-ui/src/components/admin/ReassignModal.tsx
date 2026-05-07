import { useState } from "react";
import api from "@/services/api";
import { useReassignmentOptions } from "@/hooks/use-ressignment";

export const ReassignModal = ({ child, onClose, onSuccess }: any) => {
  const { classes, loading } = useReassignmentOptions(child.childId);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selected) return;

    await api.post("/v1/admin/classes/reassign", {
      childId: child.childId,
      newClassId: selected,
    });

    onSuccess(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      
      <div className="bg-white w-[520px] p-6 rounded-2xl border-4 border-slate-900 space-y-5">

        <h2 className="text-xl font-black uppercase">
          Reassign {child.name}
        </h2>

        {/* LOADING */}
        {loading && (
          <p className="text-slate-400 font-bold">
            Loading available classes...
          </p>
        )}

        {/* EMPTY STATE */}
        {!loading && classes.length === 0 && (
          <p className="text-rose-500 font-bold">
            No valid classes available for this child
          </p>
        )}

        {/* CLASS LIST */}
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {classes.map((c) => {
            const isFull = c.isFull;

            return (
              <button
                key={c.id}
                disabled={isFull}
                onClick={() => setSelected(c.id)}
                className={`
                  w-full p-4 border-4 rounded-xl text-left
                  ${selected === c.id ? "border-sky-500 bg-sky-50" : "border-slate-200"}
                  ${isFull ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-50"}
                `}
              >
                <p className="font-black uppercase">{c.name}</p>

                <p className="text-xs text-slate-500 font-bold">
                  {c.registered}/{c.capacity} · {c.availableSpots} spots left
                </p>
              </button>
            );
          })}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 border-4 p-3 font-black"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="flex-1 bg-rose-400 text-white font-black border-4 p-3"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};