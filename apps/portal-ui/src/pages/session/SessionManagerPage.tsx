import { useState } from 'react';
import { useSessions } from '@/hooks/use-sessions';
import { SessionStatusHeader } from '@/components/session/manager/SessionStatusHeader';
import { SessionCard } from '@/components/session/manager/SessionCard';

import { SessionEntity } from '@mle/types';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { CloneSessionModal, CreateSessionModal } from '@/components/session/manager';

export const SessionManagerPage = () => {
  const { sessions, activeSession, isLoading, activateSession } = useSessions();
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [sessionToClone, setSessionToClone] = useState<SessionEntity | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const queryClient = useQueryClient();

  const handleOpenCloneModal = (session?: SessionEntity) => {
    setSessionToClone(session || activeSession || null);
    setShowCloneModal(true);
  };

  const handleCreateConfirm = async (dto: any) => {
    try {
      await api.post('/sessions', dto);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    } catch (error) {
      console.error("Creation failed", error);
    }
  };

 const handleHeaderAction = () => {
  if (activeSession) {
    // 1. If a session is already live, the Admin likely wants to CLONE it 
    // for the next term. We pre-set the active session as the source.
    handleOpenCloneModal(); 
  } else {
    // 2. If the system is empty (no active session), cloning is impossible.
    // We open the CREATE BLANK modal instead.
    setShowCreateModal(true);
  }
};

  const handleCloneConfirm = async (data: { name: string; year: number }) => {
  if (!sessionToClone) return;
  try {
    await api.post(`/sessions/${sessionToClone.id}/clone`, data);
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
    setShowCloneModal(false); // 👈 Close here for better UX
  } catch (error) {
    alert("Error cloning session.");
    throw error;
  }
};

  if (isLoading) {
    return <div className="p-10 font-black uppercase animate-pulse">Loading System State...</div>;
  }

  return (
    <div className="space-y-10 p-6 animate-in fade-in duration-500">
      <SessionStatusHeader 
        activeSession={activeSession} 
        onNewSession={handleHeaderAction} 
      />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Type the 'session' parameter here to resolve ts(7006) */}
        {sessions?.map((session: SessionEntity) => (
          <SessionCard 
            key={session.id} 
            session={session} 
            isActive={session.id === activeSession?.id}
            onActivate={() => activateSession(session.id)}
            onClone={() => handleOpenCloneModal(session)}
          />
        ))}
      </section>
      <CreateSessionModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateConfirm}
      />
      <CloneSessionModal 
        isOpen={showCloneModal}
        onClose={() => setShowCloneModal(false)}
        sourceSessionName={sessionToClone?.name || ''}
        onConfirm={handleCloneConfirm}
      />
    </div>
  );
};