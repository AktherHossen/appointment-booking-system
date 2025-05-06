
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type NavItem = {
  label: string;
  icon: JSX.Element;
  href: string;
  roles: string[];
};

const Navigation = ({ activeTab, setActiveTab }: { 
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("receptionist");
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        // Fetch user role from the users table
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('username', session.user.email)
          .single();
        
        if (data) {
          setUserRole(data.role);
        }
      }
    };

    fetchUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          // Fetch user role when auth state changes
          setTimeout(async () => {
            const { data } = await supabase
              .from('users')
              .select('role')
              .eq('username', session.user.email)
              .single();
            
            if (data) {
              setUserRole(data.role);
            }
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const navItems: NavItem[] = [
    { 
      label: "Appointments", 
      icon: <Calendar className="h-5 w-5 mr-2" />, 
      href: "appointments",
      roles: ["admin", "receptionist"]
    },
    { 
      label: "Doctors", 
      icon: <Users className="h-5 w-5 mr-2" />, 
      href: "doctors",
      roles: ["admin"] // Only admins can manage doctors
    },
    { 
      label: "SMS Templates", 
      icon: <MessageSquare className="h-5 w-5 mr-2" />, 
      href: "templates",
      roles: ["admin"] // Only admins can manage SMS templates
    },
    { 
      label: "Settings", 
      icon: <Settings className="h-5 w-5 mr-2" />, 
      href: "settings",
      roles: ["admin", "receptionist"]
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    userRole ? item.roles.includes(userRole) : false
  );

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Redirect to login page or show success message
      toast({
        title: "Signed out successfully",
        description: "You have been logged out"
      });
      window.location.href = '/login';
    }
  };

  // Core Diagnostic Center Logo
  const CoreLogo = () => (
    <div className="flex items-center">
      <img 
        src="/public/lovable-uploads/f9df85d2-dc5f-44ef-852d-aef6eb82fe78.png" 
        alt="Core Diagnostic Ltd Logo" 
        className="h-20 mr-2" 
      />
    </div>
  );

  return (
    <header className="bg-white shadow-sm border-b border-core-green/10">
      <div className="container flex items-center justify-between py-3">
        <CoreLogo />
        
        {!user ? (
          <Button onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        ) : isMobile ? (
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
                  {filteredNavItems.map((item) => (
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
                  <Button
                    variant="ghost"
                    className="justify-start rounded-none h-10 text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center">
            <nav className="flex items-center space-x-1 mr-4">
              {filteredNavItems.map((item) => (
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
            <Button 
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
