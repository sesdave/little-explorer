// apps/web/src/hooks/useEnrollmentStatus.ts
import { useMemo } from 'react';

interface EnrollmentData {
  children: any[];
  session: any | null;
  pendingApplication: any | null;
}

export const useEnrollmentStatus = (data: EnrollmentData) => {
  const { children, session, pendingApplication } = data;

  const activeApplication = pendingApplication;

  // 🧠 Per-child status map
  const childStatusMap = useMemo(() => {
    const map: Record<string, 'NOT_STARTED' | 'PENDING' | 'CONFIRMED'> = {};

    children?.forEach((child: any) => {
      const regs =
        child.registrations?.filter(
          (r: any) => r.sessionId === session?.id
        ) || [];

      if (!regs.length) {
        map[child.id] = 'NOT_STARTED';
      } else if (regs.some((r: any) => r.status === 'CONFIRMED')) {
        map[child.id] = 'CONFIRMED';
      } else {
        map[child.id] = 'PENDING';
      }
    });

    return map;
  }, [children, session]);

  const needsEnrollment = useMemo(() => {
    if (!session) return false;

    return children?.some(
      (child: any) => childStatusMap[child.id] === 'NOT_STARTED'
    );
  }, [children, session, childStatusMap]);

  const needsPayment = useMemo(() => {
    if (!activeApplication) return false;
    return activeApplication.status === 'PENDING';
  }, [activeApplication]);

  const isActive = useMemo(() => {
    return activeApplication?.status === 'COMPLETED';
  }, [activeApplication]);

  return {
    needsEnrollment,
    needsPayment,
    isActive,
    childStatusMap,
    pendingApplication: activeApplication,
    activeSessionName: session?.name || 'New Season',
    isSessionActive: !!session,
  };
};