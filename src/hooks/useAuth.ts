import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  email: string;
  name: string;
  loginTime: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('crediario_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Check if login is still valid (24 hours)
          const loginTime = new Date(userData.loginTime);
          const now = new Date();
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            setUser(userData);
          } else {
            // Session expired
            localStorage.removeItem('crediario_user');
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('crediario_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Demo authentication - replace with real auth
      if (email && password) {
        const userData: User = {
          email,
          name: email.split('@')[0],
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('crediario_user', JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('crediario_user');
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading
  };
};

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthState();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};