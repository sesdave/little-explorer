import { RegistrationFlow } from '@/components/registration/RegistrationFlow';
import { useNavigate } from 'react-router-dom';

export const RegistrationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate('/')} 
        className="text-slate-400 font-bold hover:text-sky-500 flex items-center gap-2 transition-colors"
      >
        ← Back to Dashboard
      </button>

      <header className="text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Enrollment</h1>
        <p className="text-slate-500 font-bold">Follow the steps to secure a spot.</p>
      </header>

      <RegistrationFlow />
    </div>
  );
};