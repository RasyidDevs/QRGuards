import { type ChangeEvent } from "react";
import { Upload, Loader2 } from "lucide-react";

type Props = {
  loading: boolean;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export default function UploadButton({
  loading,
  onUpload,
  className = "",
}: Props) {
  return (
    <label
      className={`group relative flex flex-1 cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-500/40 transition-all hover:bg-blue-500 active:scale-95 ${
        loading ? "pointer-events-none opacity-70" : ""
      } ${className}`}>
      {loading ? (
        <Loader2 size={24} className="animate-spin" />
      ) : (
        <Upload className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:-translate-y-1 flex-shrink-0" />
      )}

      <span className="whitespace-nowrap text-sm  tracking-widest">
        {loading ? "Analyzing..." : "Upload QR"}
      </span>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onUpload}
        disabled={loading}
      />
    </label>
  );
}
