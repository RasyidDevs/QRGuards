import { AlertTriangle } from "lucide-react";

type AlertProps = {
  children: React.ReactNode;
  type?: "warning" | "danger";
};

export default function Alert({ children, type = "warning" }: AlertProps) {
  const style =
    type === "warning"
      ? "border-yellow-200 bg-yellow-50 text-yellow-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 ${style}`}>
      <AlertTriangle size={18} />
      <div className="text-sm">{children}</div>
    </div>
  );
}
