// 1. Imports at the top
import { ClassSession } from "@mle/types";

// 2. Interface right below imports
interface CapacityMonitorProps {
  classes: ClassSession[]; 
}

// 3. The component at the bottom
export const CapacityMonitor = ({ classes }: CapacityMonitorProps) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
    <h3 className="font-black text-lg mb-6">Live Enrollment Status</h3>
    <div className="space-y-6">
      {classes.map((c) => (
        <div key={c.id}>
          <div className="flex justify-between text-sm font-bold mb-2">
            {/* Note: Use 'title' and 'enrolled' to match ClassSession definition */}
            <span>{c.title}</span> 
            <span className={c.enrolled >= c.capacity ? 'text-rose-500' : 'text-sky-600'}>
              {c.enrolled}/{c.capacity}
            </span>
          </div>
          {/* ... rest of your progress bar code ... */}
        </div>
      ))}
    </div>
  </div>
);