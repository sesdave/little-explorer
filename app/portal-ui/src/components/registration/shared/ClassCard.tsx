interface ClassCardProps {
  item: {
    id: string;
    title: string;
    minAge: number;
    maxAge: number;
    price: number;
  };
  isEligible: boolean;
  selected: boolean;
  onToggle: () => void;
}

export const ClassCard = ({ item, isEligible, selected, onToggle }: ClassCardProps) => {
  return (
    <div className={`p-6 rounded-[2rem] border-2 transition-all ${
      !isEligible ? 'opacity-50 grayscale' : 'opacity-100'
    } ${selected ? 'border-sky-500 bg-sky-50' : 'border-slate-100'}`}>
      
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-black text-xl text-slate-900">{item.title}</h4>
          <p className="font-bold text-sky-600">${item.price}</p>
        </div>

        <button
          disabled={!isEligible}
          onClick={onToggle}
          className={`px-6 py-2 rounded-xl font-black ${
            selected ? "bg-emerald-500 text-white" : "bg-sky-500 text-white"
          } disabled:bg-slate-200`}
        >
          {selected ? "✓" : "Add"}
        </button>
      </div>
      
      {!isEligible && (
        <p className="text-[10px] font-black uppercase text-rose-500 mt-2">
          Outside age range
        </p>
      )}
    </div>
  );
};