import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  children?: NavChild[];
}

interface MainNavProps {
  items: NavItem[];
  currentPath: string;
}

export function MainNav({ items, currentPath }: MainNavProps) {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {items.map((item) => {
          const children = item.children ?? [];
          const isActive = item.href
            ? currentPath === item.href || currentPath.startsWith(`${item.href}/`)
            : children.some(
                (child) =>
                  currentPath === child.href || currentPath.startsWith(`${child.href}/`)
              );

          if (children.length > 0) {
            return (
              <NavigationMenuItem key={item.label} className="relative">
                <NavigationMenuTrigger data-active={isActive}>
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="min-w-[220px]">
                  <div className="flex flex-col gap-1 p-3">
                    {children.map((child) => (
                      <NavigationMenuLink key={child.href} asChild>
                        <a
                          href={child.href}
                          className="nav-dropdown-link"
                          data-active={
                            currentPath === child.href ||
                            currentPath.startsWith(`${child.href}/`)
                          }
                        >
                          {child.label}
                        </a>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          }

          return (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink asChild>
                <a href={item.href} className="nav-link" data-active={isActive}>
                  {item.label}
                </a>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
