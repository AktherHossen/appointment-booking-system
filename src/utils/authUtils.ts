
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
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};
