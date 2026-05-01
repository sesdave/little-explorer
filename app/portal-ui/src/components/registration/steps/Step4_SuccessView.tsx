// src/components/registration/steps/Step4_SuccessView.tsx
export const Step4_SuccessView = () => (
  <div className="text-center space-y-6 py-10 animate-in zoom-in duration-700">
    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] mx-auto flex items-center justify-center text-5xl">
      🎉
    </div>
    <h2 className="text-4xl font-black text-slate-900">You're all set!</h2>
    <p className="text-slate-500 font-medium max-w-xs mx-auto">
      An explorer's kit and receipt have been sent to your email. See you soon!
    </p>
    <button 
      onClick={() => window.location.href = '/'}
      className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black"
    >
      Return Home
    </button>
  </div>
);