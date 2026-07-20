import { useState } from "react";
import { Menu, Check } from "lucide-react";
import { themes, useTheme } from "@/lib/theme";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  children?: NavChild[];
}

interface MobileNavProps {
  items: NavItem[];
  currentPath: string;
}

const isCurrent = (href: string, currentPath: string) =>
  !href.startsWith("http") &&
  (currentPath === href || currentPath.startsWith(`${href}/`));

export function MobileNav({ items, currentPath }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const { theme, selectTheme } = useTheme();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="btn-ghost md:hidden -mr-1 h-10 w-10 !px-0"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] overflow-y-auto sm:max-w-sm">
        <SheetTitle className="text-base font-display uppercase tracking-[0.12em]">
          Menu
        </SheetTitle>
        <nav className="mt-6 flex flex-col gap-6">
          {items.map((item) => {
            const children = item.children ?? [];

            if (children.length > 0) {
              return (
                <div key={item.label} className="flex flex-col gap-1">
                  <span className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </span>
                  {children.map((child) => {
                    const isExternal = child.href.startsWith("http");
                    return (
                      <a
                        key={child.href}
                        href={child.href}
                        className="mobile-nav-link"
                        data-active={isCurrent(child.href, currentPath)}
                        onClick={() => setOpen(false)}
                        {...(isExternal
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {child.label}
                      </a>
                    );
                  })}
                </div>
              );
            }

            return (
              <a
                key={item.label}
                href={item.href}
                className="mobile-nav-link"
                data-active={isCurrent(item.href!, currentPath)}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="mt-8 border-t border-border/40 pt-4">
          <span className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Theme
          </span>
          <div className="mt-2 flex flex-col gap-1">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => selectTheme(t.value)}
                className="mobile-nav-link gap-3 text-left"
                data-active={theme === t.value}
              >
                <span className="text-lg">{t.icon}</span>
                <span className="flex-1">{t.label}</span>
                {theme === t.value && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
