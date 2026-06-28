type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const base =
    "flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition";

  const style =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${style} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}>
      {children}
    </button>
  );
}
