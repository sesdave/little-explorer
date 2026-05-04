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

  const needsEnrollment = useMemo(() => {
    if (!session) return false;

    // No application at all → user hasn't started
    return !activeApplication;
  }, [session, activeApplication]);

  const needsPayment = useMemo(() => {
    if (!activeApplication) return false;

    return (
      activeApplication.status === 'PENDING'
    );
  }, [activeApplication]);

  const isActive = useMemo(() => {
    return activeApplication?.status === 'COMPLETED';
  }, [activeApplication]);

  return {
    needsEnrollment,
    needsPayment,
    isActive,
    pendingApplication: activeApplication,
    activeSessionName: session?.name || 'New Season',
    isSessionActive: !!session
  };
};

/*export const useEnrollmentStatus = (data: EnrollmentData) => {
  const { children, session } = data;

  const needsEnrollment = useMemo(() => {
    // 1. If no session is active, we can't enroll anyway
    if (!session) return false;

    // 2. Check if any child lacks a confirmed registration for this session
    // We filter for the active session ID to ensure we aren't looking at old data
    return children?.some((child) => {
      const activeRegs = child.registrations?.filter(
        (reg: any) => reg.sessionId === session.id && reg.status === 'CONFIRMED'
      );
      return !activeRegs || activeRegs.length === 0;
    });
  }, [children, session]);

  return {
    needsEnrollment,
    activeSessionName: session?.name || 'New Season',
    isSessionActive: !!session
  };
};*/