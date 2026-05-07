import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import { ReassignButton } from "../ui/ReassignButton";

type AssignedChild = {
  childId: string;
  name: string;
  status: 'PROVISIONAL' | 'CONFIRMED';
};

type ClassItem = {
  id: string;
  name: string;
  capacity: number;
  registered: number;
  children: AssignedChild[];
};

type LoaderData = {
  data: {
    classes: ClassItem[];
  };
};

export const AdminClassAssignmentsPage = () => {
  const { data } = useLoaderData() as LoaderData;

  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  return (
    <div className="grid grid-cols-3 gap-6">

      {/* CLASS LIST */}
      <div className="bg-white p-4 border-4 border-slate-900 rounded-2xl">
        <h2 className="font-black uppercase mb-4">Classes</h2>

        {data.classes.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedClass(c)}
            className="w-full text-left p-3 border-b hover:bg-slate-50"
          >
            {c.name}
            <span className="text-xs text-slate-400 block">
              {c.registered}/{c.capacity}
            </span>
          </button>
        ))}
      </div>

      {/* CHILD LIST */}
      <div className="col-span-2 bg-white p-6 border-4 border-slate-900 rounded-2xl">
        {selectedClass ? (
          <>
            <h2 className="font-black uppercase mb-4">
              {selectedClass.name} Children
            </h2>

            {selectedClass.children.map((child) => (
              <div
                key={child.childId}
                className="flex justify-between p-3 border-b"
              >
                <span>{child.name}</span>
                <ReassignButton child={child} />
              </div>
            ))}
          </>
        ) : (
          <p className="text-slate-400">Select a class</p>
        )}
      </div>
    </div>
  );
};