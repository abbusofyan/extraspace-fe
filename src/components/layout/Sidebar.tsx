import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Building2, Users, FileText, Settings, Tag, Activity } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { can } from "@/utils/permissions";

interface SidebarProps {
  className?: string;
}

// Base navigation structure
const navigation = [
  { name: "Facilities", href: "/facilities", icon: Building2, permission: "facility" },
  { name: "Staff", href: "/staff", icon: Users, permission: "staff" },
  { name: "Form Entries", href: "/quote-requests", icon: FileText, permission: "form-entry" },
  { name: "Role Management", href: "/roles", icon: Settings, permission: "role" },
  { name: "Promotions", href: "/promotions", icon: Tag, permission: "promotion" },
  { name: "Email Customisation", href: "/email-customisation", icon: FileText, permission: "email-customization" },
  { name: "API Logging", href: "/logging", icon: Activity, permission: "api-logging" },
];

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Only show items user has permission for
  const filteredNavigation = navigation.filter((item) => {
    return (
      can(user, `read-${item.permission}`) ||
      can(user, `full-access-${item.permission}`)
    );
  });

  return (
    <div className={cn("flex h-full w-64 flex-col bg-card border-r", className)}>
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <img
            src="/img/icon.webp"
            alt="Logo"
            className="h-7 w-auto"
          />
          Get Price System
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-secondary")}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
