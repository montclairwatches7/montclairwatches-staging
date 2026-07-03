import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { useStore } from '@/store/useStore';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
  phone?: string;
  avatar?: string;
  is_blocked?: boolean;
  addresses?: any[];
}


interface AuthContextType {
  user: User | null;
  adminUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  logout: () => void;
  adminLogout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { setCart, setWishlist } = useStore();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedAdmin = localStorage.getItem('adminUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      hydrateStore();
    }
    if (savedAdmin) {
      setAdminUser(JSON.parse(savedAdmin));
    }
    setIsLoading(false);
  }, []);

  const hydrateStore = async () => {
    try {
      const guestCartJson = localStorage.getItem('guest_cart');
      if (guestCartJson) {
        try {
          const guestCart = JSON.parse(guestCartJson);
          if (Array.isArray(guestCart) && guestCart.length > 0) {
            await Promise.all(
              guestCart.map((item: any) =>
                api.post('/store/cart/add', { productId: item.productId, quantity: item.quantity })
              )
            );
          }
        } catch (e) {
          console.error('Failed to sync guest cart:', e);
        } finally {
          localStorage.removeItem('guest_cart');
        }
      }

      const [{ data: cart }, { data: wishlist }] = await Promise.all([
        api.get('/store/cart'),
        api.get('/store/wishlist')
      ]);
      setCart(cart);
      setWishlist(wishlist.map((item: any) => item.product_id.toString()));
    } catch (err) {
      console.error('Failed to hydrate store:', err);
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    await hydrateStore();
  };

  const adminLogin = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAdminUser(data);
    localStorage.setItem('adminUser', JSON.stringify(data));
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    await hydrateStore();
  };

  const googleLogin = async (credential: string) => {
    const { data } = await api.post('/auth/google', { credential });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    await hydrateStore();
  };

  const updateProfile = async (profileData: Partial<User>) => {
    const { data } = await api.put('/auth/profile', profileData);
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    if (!user) return;
    const { data } = await api.get('/auth/me');
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCart([]);
    setWishlist([]);
  };

  const adminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('adminUser');
  };

  const forgotPassword = async (email: string) => {
    await api.post('/auth/forgot-password', { email });
  };

  const verifyOTP = async (email: string, otp: string) => {
    await api.post('/auth/verify-otp', { email, otp });
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    await api.post('/auth/reset-password', { email, otp, newPassword });
  };

  return (
    <AuthContext.Provider value={{
      user,
      adminUser,
      login,
      adminLogin,
      register,
      googleLogin,
      updateProfile,
      refreshUser,
      forgotPassword,
      verifyOTP,
      resetPassword,
      logout,
      adminLogout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
