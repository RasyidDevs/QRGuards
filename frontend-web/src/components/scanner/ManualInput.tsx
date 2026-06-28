import { Link2, ArrowRight } from "lucide-react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ManualInput({ value, onChange, onSubmit }: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="group relative flex items-center gap-2 rounded-full border border-white/10 bg-black/40 p-2 pl-6 backdrop-blur-xl transition-all focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10">
      <Link2
        size={18}
        className="text-slate-500 group-focus-within:text-blue-400"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Atau masukkan URL manual..."
        className="flex-1 bg-transparent py-3 text-sm font-medium text-white outline-none placeholder:text-slate-600"
      />

      <button
        type="submit"
        disabled={!value}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition-all hover:bg-blue-500 hover:text-white disabled:opacity-20 active:scale-90 shadow-lg shadow-white/5">
        <ArrowRight size={20} />
      </button>
    </form>
  );
}
