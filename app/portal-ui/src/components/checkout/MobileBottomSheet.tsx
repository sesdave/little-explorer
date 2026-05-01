export const MobileBottomSheet = ({ isOpen, children }: { isOpen: boolean, children: React.ReactNode }) => {
  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity z-40 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      
      {/* Sheet */}
      <div className={`
        fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] shadow-2xl z-50 p-8 
        transition-transform duration-500 lg:hidden
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
        {children}
      </div>
    </>
  );
};