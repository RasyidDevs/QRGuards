type BadgeProps = {
  children: React.ReactNode;
  color?: "blue" | "green" | "red";
};

export default function Badge({ children, color = "blue" }: BadgeProps) {
  const styles = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[color]}`}>
      {children}
    </span>
  );
}
