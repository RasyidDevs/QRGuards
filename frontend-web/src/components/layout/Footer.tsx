import { Globe, Mail, Shield, Monitor, Users, Link } from "lucide-react";

const socials = [
  { icon: Shield, href: "#" },
  { icon: Users, href: "#" },
  { icon: Monitor, href: "#" },
  { icon: Link, href: "#" },
  { icon: Mail, href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative w-full bg-surface font-body">
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-12 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
          <button className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-white/10 bg-surface text-muted font-medium transition-transform hover:text-primary hover:scale-105 active:scale-95">
            <Globe size={20} />
            Indonesia
          </button>

          <div className="flex gap-3">
            {socials.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={index}
                  href={item.href}
                  className="w-11 h-11 rounded-full bg-surface text-muted border border-white/10 transition-all hover:bg-muted  hover:text-primary flex items-center justify-center shadow-lg">
                  <Icon size={20} strokeWidth={2.5} />
                </a>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 pt-8 border-t border-white/10">
          <p className="text-muted text-sm font-medium">
            © 2026 QRGuard · Scan Before You Trust
          </p>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted">
            <a href="#" className="hover:text-text">
              Terms
            </a>

            <a href="#" className="hover:text-text">
              Privacy
            </a>

            <a href="#" className="hover:text-text">
              Security
            </a>

            <a href="#" className="hover:text-text">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
