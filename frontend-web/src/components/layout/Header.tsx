import { Shield, Zap, Info } from "lucide-react";
import Container from "./Container";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
      <Container>
        <div className="flex h-20 items-center">
          <div className="flex flex-1 items-center gap-2 cursor-pointer group">
            <Shield
              size={44}
              strokeWidth={2.5}
              className="text-primary transition-transform duration-300 group-hover:rotate-6"
            />
            <span className="text-2xl font-black tracking-tighter text-primary">
              QRGuard
            </span>
          </div>

          <div className="flex flex-1 justify-end items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-1.5">
              <Zap size={14} className="text-primary fill-primary" />

              <span className="text-[11px] font-bold tracking-widest text-slate-500">
                timinimwmenang
              </span>
            </div>

            <button className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100 transition">
              <Info size={22} className="text-slate-600" />
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
