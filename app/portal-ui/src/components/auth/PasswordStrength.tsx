// src/components/auth/PasswordStrength.tsx

interface Props {
  password: string;
}

export const PasswordStrength = ({
  password,
}: Props) => {
  const checks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    length: password.length >= 8,
  };

  return (
    <div className="space-y-2 pt-1">

      {Object.entries(checks).map(
        ([key, passed]) => (
          <div
            key={key}
            className="flex items-center gap-2"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                passed
                  ? 'bg-emerald-500'
                  : 'bg-slate-300'
              }`}
            />

            <p
              className={`text-[10px] font-bold uppercase ${
                passed
                  ? 'text-emerald-500'
                  : 'text-slate-400'
              }`}
            >
              {key}
            </p>
          </div>
        ),
      )}
    </div>
  );
};