import { useEffect, useState } from "react";
import { Shield, Zap, Info, Menu, X } from "lucide-react";
import Container from "./Container";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Scanner", href: "#" },
    { name: "About", href: "#" },
    { name: "Contact", href: "#" },
  ];

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close with ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close when resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <Container>
          <div className="flex h-20 items-center">
            {/* Logo */}
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

            {/* Desktop Nav */}
            <nav className="hidden md:flex flex-1 justify-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative py-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors group">
                  {link.name}

                  <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex flex-1 justify-end items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-1.5">
                <Zap size={14} className="text-primary fill-primary" />

                <span className="text-[11px] font-bold tracking-widest text-slate-500">
                  GaAdaNama
                </span>
              </div>

              <button className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100 transition">
                <Info size={22} className="text-slate-600" />
              </button>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100 transition">
                {isOpen ? (
                  <X size={28} className="text-primary" />
                ) : (
                  <Menu size={28} className="text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}>
        {/* Overlay */}
        <div
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isOpen ? "opacity-50" : "opacity-0"
          }`}
        />

        {/* Sidebar */}
        <aside
          className={`absolute left-0 top-0 h-full w-[300px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-2">
                <Shield size={36} className="text-primary" />

                <span className="text-2xl font-black tracking-tight text-primary">
                  QRGuard
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col px-8 py-8">
              {navLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center justify-between py-5 text-xl font-bold text-slate-700 hover:text-primary transition-all duration-300 ${
                    isOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-4 opacity-0"
                  }`}
                  style={{
                    transitionDelay: `${index * 80}ms`,
                  }}>
                  {link.name}

                  <span className="h-2 w-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </a>
              ))}
            </nav>

            {/* Footer */}
            <div className="mt-auto border-t border-slate-100 bg-slate-50 p-6">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Zap size={20} className="fill-primary text-primary" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Developer
                  </p>

                  <p className="text-sm font-bold text-slate-700">GaAdaNama</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
