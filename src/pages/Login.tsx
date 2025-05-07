
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { signInWithEmail } from "@/utils/authUtils";

const Login = () => {
  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<{username: string, role: string}[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"receptionist" | "admin">("receptionist");
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await signInWithEmail(email, password);

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
      } else if (data.user) {
        // Fetch the user role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('username', email)
          .single();

        if (userError) {
          console.error("Error fetching user role:", userError);
        }

        // Redirect based on role
        navigate('/');
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData?.role || "user"}!`
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, role')
        .order('role');
      
      if (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Could not fetch available users",
          variant: "destructive"
        });
      } else {
        setAvailableUsers(data || []);
        setShowUsers(!showUsers);
      }
    } catch (error) {
      console.error("Error in fetchAvailableUsers:", error);
    }
  };

  const useCredentials = (username: string) => {
    setEmail(username);
    // Note: Password still needs to be entered manually
    toast({
      title: "Credentials Applied",
      description: "Email filled in. You still need to enter the correct password."
    });
  };

  // Filter users based on selected role
  const filteredUsers = availableUsers.filter(user => 
    !selectedRole || user.role === selectedRole
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <img 
              src="/public/lovable-uploads/f9df85d2-dc5f-44ef-852d-aef6eb82fe78.png" 
              alt="Core Diagnostic Ltd Logo" 
              className="h-16" 
            />
          </div>
          <CardTitle className="text-2xl font-bold">Core Diagnostic</CardTitle>
          <CardDescription>Login to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6">
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              <Button
                variant={selectedRole === "receptionist" ? "default" : "outline"}
                onClick={() => setSelectedRole("receptionist")}
                className={selectedRole === "receptionist" ? "bg-medical-800" : ""}
              >
                Receptionist
              </Button>
              <Button
                variant={selectedRole === "admin" ? "default" : "outline"}
                onClick={() => setSelectedRole("admin")}
                className={selectedRole === "admin" ? "bg-medical-800" : ""}
              >
                Admin
              </Button>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-medical-800 hover:bg-medical-700" 
              disabled={loading}
            >
              {loading ? "Logging in..." : `Login as ${selectedRole}`}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              type="button" 
              className="w-full text-gray-500" 
              onClick={fetchAvailableUsers}
            >
              {showUsers ? "Hide Available Users" : "Show Available Users"}
            </Button>
            
            {showUsers && filteredUsers.length > 0 && (
              <div className="mt-4 border rounded-md p-3">
                <h3 className="text-sm font-medium mb-2">Available {selectedRole}s:</h3>
                <ul className="space-y-2">
                  {filteredUsers.map((user, index) => (
                    <li key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <span>{user.username}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => useCredentials(user.username)}
                      >
                        Use
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {showUsers && filteredUsers.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">No {selectedRole} users found.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500">
          Core Diagnostic Management System
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
