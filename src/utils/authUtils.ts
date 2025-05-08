
import { supabase } from "@/integrations/supabase/client";

export const getRole = async (email: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('username', email)
      .single();
    
    if (error) {
      console.error("Error fetching user role:", error);
      return "receptionist"; // Default role
    }
    
    return data?.role || "receptionist";
  } catch (error) {
    console.error("Error in getRole:", error);
    return "receptionist"; // Default role
  }
};

export const isAdmin = async (email: string): Promise<boolean> => {
  const role = await getRole(email);
  return role === "admin";
};

export const signInWithEmail = async (email: string, password: string) => {
  // First, check if credentials match in our custom users table
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', email)
    .eq('password', password)
    .single();
  
  if (error || !data) {
    return { 
      data: { user: null }, 
      error: { message: 'Invalid email or password' } 
    };
  }

  // If credentials are valid, create a session
  // Since we're not using Supabase Auth but our custom table,
  // we'll simulate a user object
  return { 
    data: { 
      user: { 
        email: data.username,
        id: data.id.toString(),
        user_metadata: { role: data.role }
      } 
    }, 
    error: null 
  };
};

export const signOut = async () => {
  // Since we're using a custom authentication system,
  // we just need to clear any session data from localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
  return { error: null };
};
