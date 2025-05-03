
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type NavItem = {
  label: string;
  icon: JSX.Element;
  href: string;
};

const Navigation = ({ activeTab, setActiveTab }: { 
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { 
      label: "Appointments", 
      icon: <Calendar className="h-5 w-5 mr-2" />, 
      href: "appointments" 
    },
    { 
      label: "Doctors", 
      icon: <Users className="h-5 w-5 mr-2" />, 
      href: "doctors" 
    },
    { 
      label: "SMS Templates", 
      icon: <MessageSquare className="h-5 w-5 mr-2" />, 
      href: "templates" 
    },
    { 
      label: "Settings", 
      icon: <Settings className="h-5 w-5 mr-2" />, 
      href: "settings" 
    },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center">
          <img 
            src="https://placehold.co/200x50/1e40af/ffffff?text=Diagnostic+Center" 
            alt="Diagnostic Center Logo" 
            className="h-10" 
          />
        </div>
        
        {isMobile ? (
          <>
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            
            {isMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-white shadow-md z-50">
                <nav className="flex flex-col py-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className={cn(
                        "justify-start rounded-none h-10",
                        activeTab === item.href
                          ? "bg-accent text-primary font-medium"
                          : "text-muted-foreground"
                      )}
                      onClick={() => {
                        setActiveTab(item.href);
                        setIsMenuOpen(false);
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </div>
            )}
          </>
        ) : (
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "h-9",
                  activeTab === item.href
                    ? "bg-accent text-primary font-medium"
                    : "text-muted-foreground"
                )}
                onClick={() => setActiveTab(item.href)}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navigation;
