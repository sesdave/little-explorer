import { useNavigate } from "react-router-dom";

type AssignedChild = {
  childId: string;
  name: string;
  status: 'PROVISIONAL' | 'CONFIRMED';
};

type Props = {
  child: AssignedChild;
};

export const ReassignButton = ({ child }: Props) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() =>
        navigate(`/admin/reassign/${child.childId}`)
      }
      className="text-sm font-bold text-rose-500"
    >
      Reassign
    </button>
  );
};