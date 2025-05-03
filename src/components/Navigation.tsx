
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

  // Core Diagnostic Center Logo SVG
  const CoreLogo = () => (
    <div className="flex items-center">
      <div className="mr-2">
        <svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 20C55.8 20 20 55.8 20 100C20 144.2 55.8 180 100 180C144.2 180 180 144.2 180 100C180 55.8 144.2 20 100 20Z" fill="#00af73" />
          <path d="M100 30C61.3 30 30 61.3 30 100C30 138.7 61.3 170 100 170C138.7 170 170 138.7 170 100C170 61.3 138.7 30 100 30ZM100 160C66.9 160 40 133.1 40 100C40 66.9 66.9 40 100 40C133.1 40 160 66.9 160 100C160 133.1 133.1 160 100 160Z" fill="#00af73" />
          <path d="M80 70C80 70 60 90 60 120C60 120 80 110 100 140C100 140 120 110 140 120C140 120 140 90 120 70C120 70 100 65 80 70Z" fill="#1a4b99" />
        </svg>
      </div>
      <div className="flex flex-col items-start">
        <span className="font-bold text-core-dark text-xl">CORE</span>
        <span className="text-xs tracking-wider text-core-dark">DIAGNOSTIC LTD</span>
      </div>
    </div>
  );

  return (
    <header className="bg-white shadow-sm border-b border-core-green/10">
      <div className="container flex items-center justify-between py-3">
        <CoreLogo />
        
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
