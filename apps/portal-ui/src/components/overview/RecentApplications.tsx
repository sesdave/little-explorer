// apps/web/src/components/overview/RecentApplications.tsx
export const RecentApplications = ({ applications }: any) => (
  <div className="bg-white rounded-[2.5rem] border-4 border-slate-900 p-8 shadow-[10px_10px_0px_0px_#0f172a]">
    <h2 className="text-2xl font-black uppercase italic mb-6">Recent Activity</h2>
    <div className="space-y-4">
      {applications.map((app: any) => (
        <div key={app.id} className="flex items-center justify-between p-4 border-4 border-slate-900 rounded-3xl bg-slate-50">
          <div>
            {/* 🏛️ Mapped to app.parentName from the Service */}
            <p className="font-black text-slate-900 uppercase">{app.parentName}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              {app.childCount} Explorers • {app.paymentPlan}
            </p>
          </div>
          <div className="text-right">
            <p className="font-black">${app.totalAmount}</p>
            <span className={`text-[10px] font-black uppercase ${app.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>
              {app.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);