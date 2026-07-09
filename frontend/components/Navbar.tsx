import Link from "next/link";
import { ActivitySquare, ClipboardList, Info, MapPinned, Stethoscope } from "lucide-react";

const links = [
  { href: "/", label: "Map", icon: MapPinned },
  { href: "/learn", label: "Signals", icon: Stethoscope },
  { href: "/report", label: "Report", icon: ClipboardList },
  { href: "/about", label: "About", icon: Info },
];

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white">
            <ActivitySquare className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight text-slate-950">VigiReal</span>
            <span className="block text-xs font-medium text-slate-500">
              Real-time biohazard intelligence
            </span>
          </span>
        </Link>

        <div className="flex flex-wrap gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
