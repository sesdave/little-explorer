import { Link } from 'react-router-dom';
import { Heart, Phone } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t-4 border-slate-900 py-8 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-black uppercase tracking-wider text-slate-500">
        
        {/* LEFT: Branding Statement */}
        <div className="flex items-center gap-2 text-slate-900">
          <span>🎪</span>
          <span>VBS ECWA Goodnews Maitama</span>
        </div>

        {/* CENTER: Clean links + Contact support element */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center flex-wrap justify-center gap-x-6 gap-y-2 text-slate-700">
            <Link to="/dashboard" className="hover:text-sky-500 transition-colors">
              Dashboard
            </Link>
            <Link to="/dashboard/classes" className="hover:text-sky-500 transition-colors">
              Classes
            </Link>
            <Link to="/dashboard/billing" className="hover:text-sky-500 transition-colors">
              Billing
            </Link>
            <Link to="/dashboard/donate" className="text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1">
              Support <Heart size={12} className="fill-rose-500 text-rose-500" />
            </Link>
          </div>
          
          {/* Subtle Phone Support Line */}
          <a 
            href="tel:+2340000000000" 
            className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-600 transition-colors tracking-widest mt-1 normal-case font-bold"
          >
            <Phone size={10} strokeWidth={3} className="text-slate-400" />
            Support: +234 (0) VBS-ECWA-HELP
          </a>
        </div>

        {/* RIGHT: Compact Copyright */}
        <div className="text-slate-400 font-bold tracking-widest text-[10px]">
          &copy; {currentYear} All Rights Reserved
        </div>

      </div>
    </footer>
  );
};