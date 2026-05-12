import { useState } from 'react';
import { 
  Send, Mail, MessageSquare, Users, 
  BookOpen, AlertTriangle, CheckCircle2, 
  Loader2, Radio, History, Clock, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useBroadcast } from '@/hooks/use-broadcast';

export const BroadcastPage = () => {
  const [type, setType] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [target, setTarget] = useState<'ALL_PARENTS' | 'SPECIFIC_CLASS'>('ALL_PARENTS');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const { 
    classes, 
    recipientCount, 
    isCountLoading, 
    sendBroadcast, 
    isSending,
    history,
    isLoadingHistory 
  } = useBroadcast(target, selectedClassId);

  const handleTargetChange = (newTarget: 'ALL_PARENTS' | 'SPECIFIC_CLASS') => {
    setTarget(newTarget);
    if (newTarget === 'ALL_PARENTS') setSelectedClassId('');
  };

  const handleLaunch = async () => {
    // 🛡️ Validation
    if (!content) return toast.error("Message content cannot be empty.");
    if (type === 'EMAIL' && !subject) return toast.error("Email subject is required.");
    if (target === 'SPECIFIC_CLASS' && !selectedClassId) return toast.error("Please select a target class.");
    if (recipientCount === 0) return toast.error("No recipients found for this selection.");

    const confirmMsg = `Confirm Launch: Send ${type} to ${recipientCount} registered parents?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await sendBroadcast({
        type,
        targetType: target,
        classId: selectedClassId,
        subject,
        content
      });
      toast.success("Broadcast signals successfully dispatched!");
      setContent('');
      setSubject('');
    } catch (error) {
      toast.error("Critical failure during broadcast transmission.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <header className="flex justify-between items-end border-b-8 border-slate-900 pb-8">
        <div>
          <h1 className="text-6xl font-black text-slate-900 uppercase italic tracking-tighter">
            Broadcast
          </h1>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em] mt-2">
            Centralized Communication Hub
          </p>
        </div>
        <div className="text-right hidden md:block">
          <div className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full border-2 border-emerald-500 font-black text-[10px] uppercase flex items-center gap-2">
            <Radio size={12} className="animate-pulse" /> Providers Active
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* LEFT PANEL: CONFIGURATION */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* 1. CHANNEL SELECTION */}
          <section className="bg-white border-4 border-slate-900 p-6 rounded-[2.5rem] shadow-[8px_8px_0px_0px_#0f172a]">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest">01. Delivery Method</h3>
            <div className="space-y-4">
              <ConfigBtn 
                active={type === 'EMAIL'} 
                onClick={() => setType('EMAIL')}
                icon={<Mail size={20}/>} 
                label="Email Broadcast" 
                desc="SendGrid Service"
              />
              <ConfigBtn 
                active={type === 'SMS'} 
                onClick={() => setType('SMS')}
                icon={<MessageSquare size={20}/>} 
                label="SMS Message" 
                desc="Twilio (₦ Charges)"
              />
            </div>
          </section>

          {/* 2. TARGET AUDIENCE */}
          <section className="bg-white border-4 border-slate-900 p-6 rounded-[2.5rem] shadow-[8px_8px_0px_0px_#0f172a]">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest">02. Recipient Group</h3>
            <div className="space-y-4">
              <ConfigBtn 
                active={target === 'ALL_PARENTS'} 
                onClick={() => handleTargetChange('ALL_PARENTS')}
                icon={<Users size={20}/>} 
                label="All Registered" 
              />
              <ConfigBtn 
                active={target === 'SPECIFIC_CLASS'} 
                onClick={() => handleTargetChange('SPECIFIC_CLASS')}
                icon={<BookOpen size={20}/>} 
                label="Specific Class" 
              />
              
              {target === 'SPECIFIC_CLASS' && (
                <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                  <select 
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full p-4 border-4 border-slate-900 rounded-2xl font-black uppercase text-[11px] bg-slate-50 shadow-[4px_4px_0px_0px_#0f172a] focus:translate-y-[-2px] transition-all outline-none"
                  >
                    <option value="">Choose Class...</option>
                    { Array.isArray(classes) ? classes.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    )): null}
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* 3. AUDIT PREVIEW */}
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-[10px_10px_0px_0px_#38bdf8] border-4 border-slate-900">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Pre-flight Count</span>
              {isCountLoading ? <Loader2 size={18} className="animate-spin text-sky-400" /> : <CheckCircle2 size={18} className="text-emerald-400" />}
            </div>
            <div className="text-4xl font-black italic uppercase">
              {isCountLoading ? '...' : recipientCount}
              <span className="text-xs not-italic font-bold text-slate-500 ml-2 uppercase">Parents</span>
            </div>
            <p className="text-[9px] font-black text-slate-500 uppercase mt-4 italic">Only confirmed registrations included</p>
          </div>
        </aside>

        {/* RIGHT PANEL: MESSAGE COMPOSER */}
        <main className="lg:col-span-8">
          <div className="bg-white border-4 border-slate-900 rounded-[3.5rem] shadow-[15px_15px_0px_0px_#0f172a] overflow-hidden h-full flex flex-col">
            <div className="bg-slate-900 p-8 flex items-center justify-between">
              <h2 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-3">
                <Send size={18} className="text-sky-400" /> Message Composer
              </h2>
            </div>

            <div className="p-10 space-y-8 flex-1">
              {type === 'EMAIL' && (
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-4">Subject</label>
                  <input 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="E.g., Vacation Bible School - Weekly Update"
                    className="w-full p-5 border-4 border-slate-900 rounded-2xl font-bold bg-white focus:shadow-[4px_4px_0px_0px_#0f172a] outline-none"
                  />
                </div>
              )}

              <div className="space-y-3 flex-1 flex flex-col">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-4">
                  {type === 'SMS' ? 'SMS Body (Charges per 160 chars)' : 'Message Content'}
                </label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Enter your message here..."
                  className="w-full p-8 border-4 border-slate-900 rounded-[2.5rem] font-medium bg-white focus:shadow-[4px_4px_0px_0px_#0f172a] outline-none resize-none flex-1"
                />
              </div>

              {type === 'SMS' && (
                <div className="bg-amber-50 border-4 border-amber-500/20 p-4 rounded-2xl flex gap-4 items-center">
                  <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                  <p className="text-[9px] font-bold text-amber-700 uppercase">
                    Approx. ₦{(recipientCount * 4).toLocaleString()} per segment. Check Twilio balance before sending.
                  </p>
                </div>
              )}
            </div>

            <div className="p-10 bg-slate-50 border-t-4 border-slate-900">
              <button 
                onClick={handleLaunch}
                disabled={isSending || isCountLoading}
                className={`w-full py-8 rounded-3xl border-4 border-slate-900 shadow-[10px_10px_0px_0px_#0f172a] flex items-center justify-center gap-4 font-black uppercase italic tracking-widest text-lg transition-all active:shadow-none active:translate-x-1 active:translate-y-1
                  ${isSending ? 'bg-slate-300' : 'bg-emerald-400 hover:bg-emerald-300'}
                `}
              >
                {isSending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                {isSending ? "Transmitting..." : "Execute Broadcast"}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* 🏛️ DISPATCH HISTORY SECTION */}
      <section className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 text-white p-3 rounded-2xl">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic leading-none">Dispatch History</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Audit trail of all signals sent</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-4 border-slate-900 text-[10px] font-black uppercase text-slate-400">
                <th className="pb-4 px-2">Timestamp</th>
                <th className="pb-4 px-2">Type</th>
                <th className="pb-4 px-2">Reach</th>
                <th className="pb-4 px-2">Sender</th>
                <th className="pb-4 px-2">Status</th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.isArray(history) ? history.map((log: any) => (
                <tr key={log.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-5 px-2">
                    <p className="font-black text-xs uppercase italic">{new Date(log.createdAt).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Clock size={10} /> {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="py-5 px-2">
                    <span className={`px-3 py-1 rounded-full border-2 font-black text-[9px] uppercase ${
                      log.type === 'EMAIL' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-amber-50 border-amber-500 text-amber-700'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="py-5 px-2">
                    <div className="flex items-center gap-2 font-black text-sm text-slate-700">
                      <Users size={14} className="text-slate-300" /> {log.recipients}
                    </div>
                  </td>
                  <td className="py-5 px-2 font-bold text-xs uppercase text-slate-600">
                    {log.sender?.name || 'System'}
                  </td>
                  <td className="py-5 px-2 text-right">
                     <span className={`font-black text-[10px] uppercase italic ${
                       log.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'
                     }`}>
                       {log.status}
                     </span>
                  </td>
                  <td className="py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={18} className="text-slate-300 inline" />
                  </td>
                </tr>
              )): null}
            </tbody>
          </table>
          {!isLoadingHistory && history.length === 0 && (
            <div className="py-20 text-center text-slate-300 font-black uppercase text-sm italic">
              No archives found
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ConfigBtn = ({ active, onClick, icon, label, desc }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-5 rounded-2xl border-4 transition-all
    ${active 
      ? 'bg-slate-900 text-white border-slate-900 shadow-[4px_4px_0px_0px_#38bdf8] translate-y-[-2px]' 
      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-900 hover:text-slate-900 shadow-none'}`}
  >
    <div className="flex items-center gap-4">
      <span className={active ? 'text-sky-400' : 'text-slate-300'}>{icon}</span>
      <div className="text-left">
        <p className="font-black uppercase text-[10px] tracking-widest leading-none">{label}</p>
        {desc && <p className="text-[8px] font-bold opacity-60 uppercase mt-1">{desc}</p>}
      </div>
    </div>
    {active && <CheckCircle2 size={16} className="text-sky-400" />}
  </button>
);