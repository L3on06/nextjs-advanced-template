import {
  Bell,
  Check,
  ChevronDown,
  House,
  Info,
  Loader2,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  User,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";

const ICONS = {
  menu: Menu,
  close: X,
  check: Check,
  info: Info,
  search: Search,
  plus: Plus,
  settings: Settings,
  user: User,
  home: House,
  logout: LogOut,
  bell: Bell,
  wrench: Wrench,
  chevronDown: ChevronDown,
  loading: Loader2,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

const SIZES = { sm: "size-4", md: "size-5", lg: "size-6" } as const;

/**
 * Starter icon. Closed name list plus a three step size scale. Unknown names
 * fail the build by type, so no silent missing icons.
 */
export function AppIcon({
  name,
  size = "md",
  label,
  className,
}: {
  name: IconName;
  size?: keyof typeof SIZES;
  label?: string;
  className?: string;
}) {
  const Icon = ICONS[name];
  return <Icon aria-hidden={label ? undefined : true} aria-label={label} className={cn(SIZES[size], className)} />;
}
