// hooks/useClassAssignments.ts
import { useState } from "react";

export const useClassAssignments = (initialClasses: any[]) => {
  const [classes, setClasses] = useState(initialClasses);

  const updateChildClass = (
    childId: string,
    fromClassId: string,
    toClassId: string
  ) => {
    setClasses((prev) => {
      const next = structuredClone(prev);

      const from = next.find((c: any) => c.id === fromClassId);
      const to = next.find((c: any) => c.id === toClassId);

      if (!from || !to) return prev;

      const child = from.children.find((c: any) => c.childId === childId);
      if (!child) return prev;

      // remove from old
      from.children = from.children.filter((c: any) => c.childId !== childId);
      from.registered--;
      from.availableSpots++;

      // add to new
      child.classId = toClassId;
      to.children.push(child);
      to.registered++;
      to.availableSpots--;

      return next;
    });
  };

  return { classes, updateChildClass, setClasses };
};