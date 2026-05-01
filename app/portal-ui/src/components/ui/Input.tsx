// src/components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: string;
}

export const Input = ({ label, icon, ...props }: InputProps) => (
  <div className="flex flex-col gap-2">
    {/* Darker, bolder label */}
    <label className="text-sm font-black uppercase text-slate-900 tracking-wider ml-1">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 font-black z-10">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`
          w-full bg-white border-4 border-slate-900 rounded-2xl px-4 py-4 
          font-bold text-slate-900 placeholder:text-slate-400
          focus:ring-4 focus:ring-sky-200 focus:outline-none transition-all
          ${icon ? "pl-12" : ""}
        `}
      />
    </div>
  </div>
);